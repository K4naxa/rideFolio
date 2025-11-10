import { Injectable, NotFoundException } from '@nestjs/common';
import { Note, NoteSchemaType } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { VehicleRepository } from 'src/utils/vehicleRepository';

@Injectable()
export class NoteService {
  constructor(
    private readonly validation: AuthValidationService,
    private readonly vehicleRepo: VehicleRepository,
    private prisma: PrismaService,
  ) {}

  async createNote(UserSession: UserSession, data: NoteSchemaType) {
    await this.validation.canCreateLogs(UserSession.user.id, data.vehicleId);
    return this.prisma.note.create({
      data: {
        ...data,
        createdById: UserSession.user.id,
      },
    });
  }

  async updateNote(UserSession: UserSession, noteId: string, data: NoteSchemaType) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
    });
    if (!note) {
      throw new Error('Note not found');
    }
    await this.validation.canEditLogs(UserSession.user.id, note.vehicleId);

    return this.prisma.note.update({
      where: { id: noteId },
      data,
    });
  }

  async notePinnedToggle(UserSession: UserSession, noteId: string, pinned: boolean) {
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
    await this.validation.canDeleteLogs(UserSession.user.id, note.vehicleId);
    return this.prisma.note.delete({
      where: { id: noteId },
    });
  }

  async getNoteById(userId: string, noteId: string): Promise<Note> {
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
        createdAt: true,
        updatedAt: true,
        vehicleId: true,
        createdById: true,
        createdByUser: { select: { id: true, name: true, image: true } },
        vehicle: { select: { id: true, name: true, make: true, model: true, year: true, type: true } },
      },
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    await this.validation.hasAccessToVehicle(userId, note.vehicleId);

    return {
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
      },
    };
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
        vehicle: { select: { id: true, name: true, make: true, model: true, year: true, type: true } },
      },
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }, { createdAt: 'desc' }],
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
      },
    }));
  }

  async getNotesForVehicle(UserSession: UserSession, vehicleId: string): Promise<Note[]> {
    await this.validation.hasAccessToVehicle(UserSession.user.id, vehicleId);
    const notes = await this.prisma.note.findMany({
      where: { vehicleId },
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }, { createdAt: 'desc' }],

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
      },
    }));
  }
}
