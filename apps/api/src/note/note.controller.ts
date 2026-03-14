import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Note, NoteSchema, NoteSchemaType } from '@repo/validation';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { NoteService } from 'src/note/note.service';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import z, { ZodType } from 'zod';

@Controller('notes')
export class NoteController {
  constructor(private noteService: NoteService) {}

  @Post()
  async createNote(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(NoteSchema as ZodType)) noteDto: NoteSchemaType,
  ): Promise<Note> {
    return await this.noteService.createNote(session, noteDto);
  }

  @Get()
  async getAccessibleNotes(@Session() session: UserSession): Promise<Note[]> {
    return this.noteService.getAccessibleNotes(session.user.id);
  }

  @Get('by-id/:noteId')
  async getNoteById(
    @Session() session: UserSession,
    @Param('noteId', new ZodValidationPipe(z.cuid())) noteId: string,
  ): Promise<Note> {
    return this.noteService.getNoteById(session.user.id, noteId);
  }

  @Patch(':noteId/pin')
  async toggleNotePin(
    @Session() session: UserSession,
    @Param('noteId', new ZodValidationPipe(z.cuid())) noteId: string,
    @Body('pinned', new ZodValidationPipe(z.boolean())) pinned: boolean,
  ): Promise<Note> {
    return await this.noteService.notePinnedToggle(session, noteId, pinned);
  }

  @Patch(':noteId')
  async updateNote(
    @Session() session: UserSession,
    @Param('noteId', new ZodValidationPipe(z.cuid())) noteId: string,
    @Body(new ZodValidationPipe(NoteSchema as ZodType)) noteDto: NoteSchemaType,
  ): Promise<Note> {
    return await this.noteService.updateNote(session, noteId, noteDto);
  }

  @Delete(':noteId')
  async deleteNote(@Session() session: UserSession, @Param('noteId', new ZodValidationPipe(z.cuid())) noteId: string) {
    await this.noteService.deleteNote(session, noteId);
    return { status: 'success' };
  }

  @Get('vehicle/:vehicleId')
  async getNotesForVehicle(
    @Session() session: UserSession,
    @Param('vehicleId', new ZodValidationPipe(z.cuid())) vehicleId: string,
  ) {
    return this.noteService.getNotesForVehicle(session, vehicleId);
  }
}
