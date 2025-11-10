import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { NoteSchema, NoteSchemaType } from '@repo/validation';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { NoteService } from 'src/note/note.service';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { ZodType } from 'zod/v4/classic/external.cjs';

@Controller('notes')
export class NoteController {
  constructor(private noteService: NoteService) {}

  @Post()
  async createNote(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(NoteSchema as ZodType)) noteDto: NoteSchemaType,
  ) {
    const newNote = await this.noteService.createNote(session, noteDto);
    return { status: 'success', id: newNote.id };
  }

  @Get()
  async getAccessibleNotes(@Session() session: UserSession) {
    return this.noteService.getAccessibleNotes(session.user.id);
  }

  @Get(':noteId')
  async getNoteById(@Session() session: UserSession, @Param('noteId') noteId: string) {
    return this.noteService.getNoteById(session.user.id, noteId);
  }

  @Patch(':noteId/pin')
  async toggleNotePin(
    @Session() session: UserSession,
    @Param('noteId') noteId: string,
    @Body('pinned') pinned: boolean,
  ) {
    await this.noteService.notePinnedToggle(session, noteId, pinned);
    return { status: 'success' };
  }

  @Patch(':noteId')
  async updateNote(
    @Session() session: UserSession,
    @Param('noteId') noteId: string,
    @Body(new ZodValidationPipe(NoteSchema as ZodType)) noteDto: NoteSchemaType,
  ) {
    const updatedNote = await this.noteService.updateNote(session, noteId, noteDto);
    return { status: 'success', data: { id: updatedNote.id } };
  }

  @Delete(':noteId')
  async deleteNote(@Session() session: UserSession, @Param('noteId') noteId: string) {
    await this.noteService.deleteNote(session, noteId);
    return { status: 'success' };
  }

  @Get('vehicle/:vehicleId')
  async getNotesForVehicle(@Session() session: UserSession, @Param('vehicleId') vehicleId: string) {
    return this.noteService.getNotesForVehicle(session, vehicleId);
  }
}
