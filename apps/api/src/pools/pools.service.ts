import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'prisma/generated/prisma/client';
import { AccessiblePool, PoolMemberRoleCode, PoolSchemaValues, PoolDetails } from '@repo/validation';
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

  async getPoolDetails(userSession: UserSession, poolId: string): Promise<PoolDetails> {
    // Validate that the user has access to the pool

    const poolDetails = await this.prisma.pool.findUnique({
      where: { id: poolId, members: { some: { userId: userSession.user.id } } },

      select: {
        id: true,
        type: true,
        name: true,
        description: true,
        createdAt: true,
        members: {
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
        },
        vehicles: {
          select: {
            addedAt: true,
            allowMembersToAddLogs: true,
            allowMembersToDeleteLogs: true,
            allowMembersToEditLogs: true,
            vehicle: {
              include: {
                ...this.vehicleTransformer.DBInclude_BasicVehicle,
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!poolDetails) throw new NotFoundException(`Pool not found or access denied.`);

    return {
      id: poolDetails.id,
      type: poolDetails.type,
      name: poolDetails.name,
      description: poolDetails.description,
      createdAt: poolDetails.createdAt,
      userRole: poolDetails.members.find((m) => m.user.id === userSession.user.id)?.role as PoolMemberRoleCode,
      Members: poolDetails.members,
      Vehicles: poolDetails.vehicles.map((v) => ({
        addedAt: v.addedAt,
        isCurrentUserOwner: v.vehicle.owner.id === userSession.user.id,
        owner: v.vehicle.owner,
        data: this.vehicleTransformer.toBasicVehicle(v.vehicle),
      })),
    };
  }

  async deletePool(userSession: UserSession, poolId: string): Promise<void> {
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

    await this.prisma.pool.delete({
      where: { id: validatedPoolId.poolId },
    });
  }
}
