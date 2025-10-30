export interface TSession {
  accessToken?: string;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}
