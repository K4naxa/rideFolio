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
