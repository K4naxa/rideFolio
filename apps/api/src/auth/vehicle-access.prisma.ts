import { Prisma } from 'prisma/generated/client';

export class VehicleAccessPrisma {
  // Used to check if a user has access to a vehicle
  static forUser(userId: string): Prisma.VehicleWhereInput {
    return {
      OR: [{ ownerId: userId }, { groups: { some: { group: { members: { some: { userId } } } } } }],
    };
  }

  // For when the vehicle is a nested relation (e.g notes, todos, etc.. )
  static nestedForUser(userId: string): { vehicle: Prisma.VehicleWhereInput } {
    return {
      vehicle: this.forUser(userId),
    };
  }
}
