import { z } from "zod";
import { TimelineEventTypes } from "./timeline.types";

export const TimelineQuerySchema = z.object({
  vehicleId: z.cuid("Invalid vehicle ID").optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  eventTypes: z.array(z.enum(TimelineEventTypes)).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
});

export type TimelineQueryInput = z.infer<typeof TimelineQuerySchema>;
