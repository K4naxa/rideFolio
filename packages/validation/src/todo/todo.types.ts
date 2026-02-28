import { TConversionResult, VehicleMinimal } from "../vehicle";
import { UserMinimal } from "../user";

export type TodoDueOdometer = TConversionResult & {
  overdue: boolean;
  remaining: number | null;
};

export type TodoDueDate = {
  date: Date;
  overdue: boolean;
};

export type BaseTodo = {
  id: string;
  title: string;
  description: string | null;
  priority: TodoPriorityType | null;
  isCompleted: boolean;
  dueDate: TodoDueDate | null;
  dueOdometer: TodoDueOdometer | null;
  createdData: {
    user: UserMinimal | null;
    date: Date;
  };
  completedData: {
    user: UserMinimal | null;
    odometer: TConversionResult;
    date: Date | null;
  } | null;
};

export interface TodoWithVehicle extends BaseTodo {
  vehicle: VehicleMinimal;
}

export const TodoPriority = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type TodoPriorityType = (typeof TodoPriority)[number];
