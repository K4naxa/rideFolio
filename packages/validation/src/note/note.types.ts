export type Note = {
  id: string;
  title: string | null;
  content: string | null;
  tags: string[];
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  vehicle: {
    id: string;
    make: string | null;
    name: string;
    model: string | null;
    year: number | null;
    type: string | null;
  };
};
