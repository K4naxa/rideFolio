import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Pool, Prisma } from 'prisma/generated/prisma/client';
import { AccessiblePool, TPoolMember, TPoolVehicle, PoolMemberRoleCode, PoolSchemaValues } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { VehicleRepository } from 'src/utils/vehicleRepository';
import { VehicleTransformerService } from 'src/utils/vehicleTransformer.service';

@Injectable()
export class PoolsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vehicleRepository: VehicleRepository,
    private readonly vehicleTransformer: VehicleTransformerService,
    private readonly authValidationService: AuthValidationService,
  ) {}

  async createNewPool(userSession: UserSession, newPoolDto: PoolSchemaValues): Promise<{ newPoolId: string }> {
    const { vehicleIds, ...poolData } = newPoolDto;
    let createdPool: Pool | undefined;

    try {
      createdPool = await this.prisma.$transaction(async (prisma) => {
        // 1. Create new pool
        const pool = await prisma.pool.create({
          data: {
            ...poolData,
          },
        });

        // 2. Add the creator into the pool as a creator
        await prisma.poolMember.create({
          data: {
            poolId: pool.id,
            userId: userSession.user.id,
            role: 'OWNER',
          },
        });

        // 3. Add optional vehicles to the pool if provided
        if (vehicleIds && vehicleIds.length > 0) {
          for (const id of vehicleIds) {
            await prisma.poolVehicle.create({
              data: {
                poolId: pool.id,
                vehicleId: id,
              },
            });
          }
        }

        console.log(`Created new pool with id: ${pool.id}`);
        return pool;
      });
    } catch (error) {
      console.error('ERROR creating a pool: ', error);

      throw new BadRequestException({
        message: 'Error creating a new pool',
      });
    }

    if (!createdPool) {
      throw new BadRequestException({
        message: 'Failed to create pool',
      });
    }

    return { newPoolId: createdPool.id };
  }

  // =================================================================
  // == FETCH ALL POOLS FOR A USER ==
  // =================================================================

  async getAccessiblePools(currentUserId: string): Promise<AccessiblePool[]> {
    const pools = await this.prisma.pool.findMany({
      // 1. Find all pools where the current user is a member
      where: {
        members: {
          some: {
            userId: currentUserId,
          },
        },
      },
      // 2. Use `include` to fetch related data.
      select: {
        id: true,
        type: true,
        name: true,
        allowMembersToAddLogs: true,
        allowMembersToDeleteLogs: true,
        allowMembersToEditLogs: true,
        allowMembersToAddVehicles: true,

        // 3. Include the 'members' relation, but ONLY the one for the current user.
        // This is the key to getting the role efficiently.
        members: {
          where: {
            userId: currentUserId, // Filter to get just this user's membership
          },
          select: {
            role: true, // We only need their role from this record
          },
        },

        // Include the count of vehicles and members for UI purposes.
        _count: {
          select: {
            vehicles: true,
            members: true,
          },
        },
        // You can also include a snippet of vehicle info if needed for the UI
        vehicles: {
          select: {
            vehicle: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // 4. Transform the data for a cleaner frontend experience.
    const transformedPools = pools.map((pool) => {
      const currentUserRole = pool.members[0]?.role || null;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { members, vehicles, ...restOfPool } = pool;

      return {
        ...restOfPool,
        userRole: currentUserRole as PoolMemberRoleCode, // Add the role to the top level
        vehicles: vehicles.map((v) => v.vehicle), // Flatten the vehicle structure
      };
    });

    return transformedPools;
  }

  // =================================================================
  // == GET POOL DETAILS ==
  // =================================================================

  async getPoolInfo(userSession: UserSession, poolId: string) {
    // Check if the user has access to the pool
    await this.authValidationService.hasAccessToPool(userSession.user.id, poolId);

    return await this.prisma.pool.findUnique({
      where: { id: poolId },
    });
  }

  async getUserPoolRole(userSession: UserSession, poolId: string): Promise<{ role: PoolMemberRoleCode }> {
    await this.authValidationService.hasAccessToPool(userSession.user.id, poolId);

    const membership = await this.prisma.poolMember.findUnique({
      where: {
        poolId_userId: {
          poolId: poolId,
          userId: userSession.user.id,
        },
      },
      select: { role: true },
    });

    if (!membership) {
      // Should never happen if hasAccessToPool is called first
      throw new NotFoundException('Membership not found');
    }

    return { role: membership.role };
  }

  async getPoolMembers(userSession: UserSession, poolId: string): Promise<TPoolMember[]> {
    // Check if the user has access to the pool
    await this.authValidationService.hasAccessToPool(userSession.user.id, poolId);

    // Fetch all members of the pool, sorted by role
    return await this.prisma.poolMember.findMany({
      where: { poolId },
      orderBy: {
        role: 'asc', // Sort by role, so OWNER is first
      },
      select: {
        role: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  async getPoolVehicles(userSession: UserSession, id: string): Promise<TPoolVehicle[]> {
    // Check if the user has access to the pool
    await this.authValidationService.hasAccessToPool(userSession.user.id, id);

    // Fetch all vehicles in the pool
    const rawVehicles = await this.vehicleRepository.findPoolVehicles(id);

    // Add isUsersOwner flag to each vehicle
    return rawVehicles.map((vehicle) => {
      return this.vehicleTransformer.toPoolVehicle(vehicle, userSession.user.id);
    });
  }
  // =================================================================
  // == DELETE A POOL ==\
  // =================================================================
  async deletePool(userSession: UserSession, poolId: string): Promise<void> {
    // Step 1: Validate the poolId and users ownership
    const validatedPoolId = await this.prisma.poolMember.findUnique({
      where: {
        poolId_userId: {
          poolId: poolId,
          userId: userSession.user.id,
        },
        role: 'OWNER', // Ensure the user is an OWNER
      },
      select: {
        poolId: true,
      },
    });

    if (!validatedPoolId) {
      throw new ForbiddenException(`Pool not found or access denied.`);
    }

    // Final Step: If all checks pass, proceed with deletion.
    // Deleting the pool will cascade and delete all PoolMember and PoolVehicle links.
    await this.prisma.pool.delete({
      where: { id: validatedPoolId.poolId },
    });
  }
}
