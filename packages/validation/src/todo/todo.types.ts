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
  vehicleId: string;
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
