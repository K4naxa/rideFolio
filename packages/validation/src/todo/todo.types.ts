import { TConversionResult, TLogVehicle } from "../vehicle";

type TodoDueOdometer = TConversionResult & {
  overdue: boolean;
};

type TodoDueDate = {
  date: Date;
  overdue: boolean;
};
export type Todo = {
  id: string;
  vehicleData: TLogVehicle;
  title: string;
  description: string | null;
  priority: TodoPriorityType | null;
  isCompleted: boolean;
  dueDate: TodoDueDate | null;
  dueOdometer: TodoDueOdometer | null;
  createdData: {
    name: string;
    image: string | null;
    date: Date;
  };
  completedData: {
    user: {
      name: string;
      image: string | null;
    };
    odometer: TConversionResult;
    date: Date | null;
  } | null;
};

export const TodoPriority = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type TodoPriorityType = (typeof TodoPriority)[number];
