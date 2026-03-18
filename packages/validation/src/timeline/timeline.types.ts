import { TRefillForClient } from "../refill";
import { ClientMaintenance } from "../maintenance";
import { BaseTodo } from "../todo";

export const TimelineEventTypes = [
  "refill",
  "maintenance",
  "todo-completed",
] as const;
export type TimelineEventType = (typeof TimelineEventTypes)[number];

// Discriminated union types for each event
export interface TimelineRefillItem {
  type: "refill";
  timestamp: Date;
  data: TRefillForClient;
}

export interface TimelineMaintenanceItem {
  type: "maintenance";
  timestamp: Date;
  data: ClientMaintenance;
}

export interface TimelineTodoCompletedItem {
  type: "todo-completed";
  timestamp: Date;
  data: BaseTodo;
}

export type TimelineItem =
  | TimelineRefillItem
  | TimelineMaintenanceItem
  | TimelineTodoCompletedItem;

export type TimelineResponse = {
  items: TimelineItem[];
  nextCursor: string | null;
  hasMore: boolean;
};
