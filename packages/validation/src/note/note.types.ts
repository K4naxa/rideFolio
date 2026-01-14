import { NoteSchemaType } from "./note.shemas";

export type Note = {
  id: string;
  title: string | null;
  content: string | null;
  tags: string[];
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  vehicle: {
    id: string;
    make: string | null;
    name: string;
    model: string | null;
    year: number | null;
    type: string | null;
    image?: string | null;
  };
};

export type EditableNote = {
  id: string;
  title: string | null;
  content: string | null;
  tags: string[];
  vehicleId: string;
  pinned: boolean;
  updatedAt: Date;
};

export function newNote({ vehicleId, title, content, tags }: Partial<NoteSchemaType> = {}): NoteSchemaType {
  return {
    vehicleId: vehicleId || "",
    title: title || null,
    content: content || null,
    tags: tags || [],
    pinned: false,
  };
}
