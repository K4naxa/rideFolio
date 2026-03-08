import { Injectable, NotFoundException } from '@nestjs/common';
import { Note, NoteSchemaType } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { Prisma } from 'prisma/generated/client';
import { LimitsService } from 'src/limits/limits.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { VehicleAccessPrisma } from '../auth/vehicle-access.prisma';

@Injectable()
export class NoteService {
  constructor(
    private readonly validation: AuthValidationService,
    private readonly limitsService: LimitsService,
    private prisma: PrismaService,
  ) {}

  async createNote(userSession: UserSession, data: NoteSchemaType): Promise<Note> {
    const vehicle = await this.validation.hasAccessToVehicle(userSession.user.id, data.vehicleId);
    const sizeBytes = await this.limitsService.canCreateLog(userSession.user.id, vehicle.ownerId, data);

    const newNote = await this.prisma.$transaction(async (tx) => {
      await this.limitsService.incrementStorageUsage(tx, vehicle.ownerId, 'NOTE', sizeBytes);
      return tx.note.create({
        data: {
          ...data,
          createdById: userSession.user.id,
          sizeBytes,
        },
        include: {
          vehicle: true,
        },
      });
    });

    return this.toNoteFormat(newNote);
  }

  async updateNote(userSession: UserSession, noteId: string, data: NoteSchemaType): Promise<Note> {
    // Fetch existing note
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Validate permissions
    const vehicle = await this.validation.hasAccessToVehicle(userSession.user.id, note.vehicleId);

    // Calculate new size from merged data
    const mergedNote = { ...note, ...data };
    const newSize = await this.limitsService.canUpdateLog(
      userSession.user.id,
      vehicle.ownerId,
      note.sizeBytes,
      mergedNote,
    );

    // Check if we should sync storage
    const shouldSync = this.limitsService.shouldSyncStorage(note.sizeBytes, newSize);

    // Perform update (with or without storage sync)
    if (shouldSync) {
      return await this.prisma.$transaction(async (tx) => {
        await this.limitsService.syncStorageUsage(tx, vehicle.ownerId, 'NOTE', note.sizeBytes, newSize);

        const updatedNote = await tx.note.update({
          where: { id: noteId },
          data: {
            ...data,
            sizeBytes: newSize,
          },
          include: { vehicle: true },
        });
        return this.toNoteFormat(updatedNote);
      });
    } else {
      // Below threshold
      const updatedNote = await this.prisma.note.update({
        where: { id: noteId },
        data,
        include: {
          vehicle: true,
        },
      });
      return this.toNoteFormat(updatedNote);
    }
  }

  async notePinnedToggle(UserSession: UserSession, noteId: string, pinned: boolean): Promise<Note> {
    const updatedNote = await this.prisma.note.update({
      where: { id: noteId, ...VehicleAccessPrisma.nestedForUser(UserSession.user.id) },
      data: { pinned },
      include: { vehicle: true },
    });

    if (!updatedNote) throw new NotFoundException({ code: 'NOT_FOUND_OR_ACCESS_DENIED' });

    return this.toNoteFormat(updatedNote);
  }

  async deleteNote(UserSession: UserSession, noteId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId, ...VehicleAccessPrisma.nestedForUser(UserSession.user.id) },
      include: { vehicle: { select: { ownerId: true } } },
    });

    if (!note) throw new NotFoundException({ code: 'NOT_FOUND_OR_ACCESS_DENIED' });

    await this.prisma.$transaction(async (tx) => {
      await this.limitsService.decrementStorageUsage(tx, note.vehicle.ownerId, 'NOTE', note.sizeBytes);
      await tx.note.delete({ where: { id: note.id } });
    });
  }

  async getNoteById(userId: string, noteId: string): Promise<Note> {
    const note = await this.prisma.note.findUnique({
      where: {
        id: noteId,
        ...VehicleAccessPrisma.nestedForUser(userId),
      },
      include: {
        vehicle: true,
      },
    });
    if (!note) throw new NotFoundException({ code: 'NOT_FOUND_OR_ACCESS_DENIED' });

    return this.toNoteFormat(note);
  }

  async getAccessibleNotes(userId: string): Promise<Note[]> {
    const notes = await this.prisma.note.findMany({
      where: {
        ...VehicleAccessPrisma.nestedForUser(userId),
      },
      include: {
        vehicle: true,
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    });

    return notes.map((note) => this.toNoteFormat(note));
  }

  async getNotesForVehicle(UserSession: UserSession, vehicleId: string): Promise<Note[]> {
    await this.validation.hasAccessToVehicle(UserSession.user.id, vehicleId);
    const notes = await this.prisma.note.findMany({
      where: { vehicleId },
      include: { vehicle: true },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    });
    return notes.map((note) => this.toNoteFormat(note));
  }

  // Format note to a Note type expected by frontend
  private toNoteFormat(note: Prisma.NoteGetPayload<{ include: { vehicle: true } }>): Note {
    return {
      id: note.id,
      title: note.title ?? '',
      content: note.content ?? '',
      pinned: note.pinned ?? false,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      vehicle: {
        id: note.vehicle.id,
        name: note.vehicle.name,
        make: note.vehicle.make ?? '',
        model: note.vehicle.model ?? '',
        year: note.vehicle.year ?? 0,
        type: note.vehicle.type,
        image: note.vehicle.image,
      },
    };
  }
}
