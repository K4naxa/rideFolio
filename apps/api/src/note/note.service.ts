import { Injectable, NotFoundException } from '@nestjs/common';
import { EditableNote, Note, NoteSchemaType } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { LimitsService } from 'src/limits/limits.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { VehicleRepository } from 'src/utils/vehicleRepository';

@Injectable()
export class NoteService {
  constructor(
    private readonly validation: AuthValidationService,
    private readonly vehicleRepo: VehicleRepository,
    private readonly limitsService: LimitsService,
    private prisma: PrismaService,
  ) {}

  async createNote(UserSession: UserSession, data: NoteSchemaType): Promise<Note> {
    const vehicle = await this.validation.canCreateLogs(UserSession.user.id, data.vehicleId);
    const sizeBytes = await this.limitsService.canCreateLog(UserSession.user.id, vehicle.ownerId, data);

    const newNote = await this.prisma.$transaction(async (tx) => {
      await this.limitsService.incrementStorageUsage(tx, vehicle.ownerId, 'NOTE', sizeBytes);
      return await tx.note.create({
        data: {
          ...data,
          createdById: UserSession.user.id,
          sizeBytes,
        },
        select: {
          id: true,
          title: true,
          content: true,
          tags: true,
          pinned: true,
          createdAt: true,
          updatedAt: true,
          vehicleId: true,
          createdById: true,
          createdByUser: { select: { id: true, name: true, image: true } },
          vehicle: { select: { id: true, name: true, make: true, model: true, year: true, type: true } },
        },
      });
    });

    return {
      id: newNote.id,
      title: newNote.title ?? '',
      content: newNote.content ?? '',
      tags: newNote.tags ?? [],
      pinned: newNote.pinned ?? false,
      createdAt: newNote.createdAt,
      updatedAt: newNote.updatedAt,
      vehicle: {
        id: newNote.vehicle.id,
        name: newNote.vehicle.name,
        make: newNote.vehicle.make ?? '',
        model: newNote.vehicle.model ?? '',
        year: newNote.vehicle.year ?? 0,
        type: newNote.vehicle.type,
      },
    };
  }

  async updateNote(userSession: UserSession, noteId: string, data: NoteSchemaType): Promise<EditableNote> {
    // Fetch existing note
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Validate permissions
    const vehicle = await this.validation.canEditLogs(userSession.user.id, data.vehicleId);

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

        return await tx.note.update({
          where: { id: noteId },
          data: {
            ...data,
            sizeBytes: newSize,
          },
          select: {
            id: true,
            title: true,
            content: true,
            tags: true,
            pinned: true,
            vehicleId: true,
            updatedAt: true,
          },
        });
      });
    } else {
      // Below threshold
      return await this.prisma.note.update({
        where: { id: noteId },
        data,
        select: {
          id: true,
          title: true,
          content: true,
          tags: true,
          pinned: true,
          vehicleId: true,
          updatedAt: true,
        },
      });
    }
  }

  async notePinnedToggle(UserSession: UserSession, noteId: string, pinned: boolean): Promise<EditableNote> {
    const note = await this.prisma.note.findUnique({ where: { id: noteId } });
    await this.validation.canEditLogs(UserSession.user.id, note?.vehicleId);
    return this.prisma.note.update({
      where: { id: noteId },
      data: { pinned },
    });
  }

  async deleteNote(UserSession: UserSession, noteId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
    });
    if (!note) {
      throw new Error('Note not found');
    }
    const vehicle = await this.validation.canDeleteLogs(UserSession.user.id, note.vehicleId);
    await this.prisma.$transaction(async (tx) => {
      await this.limitsService.decrementStorageUsage(tx, vehicle.ownerId, 'NOTE', note.sizeBytes);
      await tx.note.delete({ where: { id: noteId } });
    });
  }

  async getEditableNote(userId: string, noteId: string): Promise<EditableNote> {
    const note = await this.prisma.note.findUnique({
      where: {
        id: noteId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        pinned: true,
        vehicleId: true,
        updatedAt: true,
      },
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    await this.validation.hasAccessToVehicle(userId, note.vehicleId);

    return note;
  }

  async getAccessibleNotes(userId: string): Promise<Note[]> {
    const accessibleVehicleIds = await this.vehicleRepo
      .findAccessibleVehicles(userId)
      .then((vehicles) => vehicles.map((v) => v.id));

    const notes = await this.prisma.note.findMany({
      where: {
        vehicleId: {
          in: accessibleVehicleIds,
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        pinned: true,
        createdAt: true,
        updatedAt: true,
        vehicleId: true,
        createdById: true,
        createdByUser: { select: { id: true, name: true, image: true } },
        vehicle: { select: { id: true, name: true, make: true, model: true, year: true, type: true, image: true } },
      },
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
    });

    return notes.map((note) => ({
      id: note.id,
      title: note.title ?? '',
      content: note.content ?? '',
      tags: note.tags ?? [],
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
    }));
  }

  async getNotesForVehicle(UserSession: UserSession, vehicleId: string): Promise<Note[]> {
    await this.validation.hasAccessToVehicle(UserSession.user.id, vehicleId);
    const notes = await this.prisma.note.findMany({
      where: { vehicleId },
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        pinned: true,
        createdAt: true,
        updatedAt: true,
        vehicleId: true,
        createdById: true,
        createdByUser: { select: { id: true, name: true, image: true } },
        vehicle: { select: { id: true, name: true, make: true, model: true, year: true, type: true, image: true } },
      },
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
    });
    return notes.map((note) => ({
      id: note.id,
      title: note.title ?? '',
      content: note.content ?? '',
      tags: note.tags ?? [],
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
    }));
  }
}
