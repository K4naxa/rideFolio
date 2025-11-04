import { cn } from "@/lib/utils";
import {
  Car,
  Bike,
  Ship,
  Cog,
  Fuel,
  Wrench,
  StickyNote,
  ListCheck,
  Bell,
  Home,
  User,
  Users,
  UserPlus,
  MoreHorizontal,
  Search,
  Mail,
  Settings,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  X,
  Sparkle,
  CarFront,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
  Camera,
  Files,
  LogOut,
  CakeSlice,
  AlertTriangle,
  Trash2,
  Droplets,
  Calendar,
  Hash,
  Building,
  NotebookPen,
  Clock,
  Gauge,
  CreditCard,
  ChartNoAxesCombined,
  ShoppingCart,
} from "lucide-vue-next";
import type { LucideIcon } from "lucide-vue-next";
import { type TVehicleTypeCode } from "@repo/validation";

interface IconSizes {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
}

const iconSizes: IconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-7 h-7",
  "2xl": "w-8 h-8",
};

// Icon props interface extending Lucide's props
interface IconProps {
  size?: keyof IconSizes;
  color?: string;
  className?: string;
  strokeWidth?: number;
  disabled?: boolean;
}

// Create wrapper components for consistent styling
const createIconComponent = (LucideIcon: LucideIcon) => {
  const IconComponent = ({
    size = "md",
    color = "currentColor",
    className = "",
    strokeWidth = 2,
  }: IconProps) => (
    <LucideIcon
      color={color}
      class={cn(iconSizes[size as keyof IconSizes], className)}
      strokeWidth={strokeWidth}
    />
  );
  IconComponent.displayName = LucideIcon.displayName || LucideIcon.name || "IconComponent";
  return IconComponent;
};

const RideFolioLogo = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L2 7L12 12L22 7L12 2Z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M2 17L12 22L22 17"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M2 12L12 17L22 12"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

// Export your Icons object
export const Icons = {
  logo: RideFolioLogo,
  car: createIconComponent(Car),
  carFront: createIconComponent(CarFront),
  bike: createIconComponent(Bike),
  ship: createIconComponent(Ship),
  otherVehicle: createIconComponent(Cog),
  hash: createIconComponent(Hash),
  vehicleMake: createIconComponent(Building),
  otherInfo: createIconComponent(NotebookPen),

  odoHours: createIconComponent(Clock),
  odoDistance: createIconComponent(Gauge),

  refill: createIconComponent(Fuel),
  maintenance: createIconComponent(Wrench),
  notes: createIconComponent(StickyNote),
  todo: createIconComponent(ListCheck),
  shoppingCart: createIconComponent(ShoppingCart),

  user: createIconComponent(User),
  users: createIconComponent(Users),
  userPlus: createIconComponent(UserPlus),

  home: createIconComponent(Home),
  settings: createIconComponent(Settings),
  search: createIconComponent(Search),
  files: createIconComponent(Files),
  mail: createIconComponent(Mail),
  logout: createIconComponent(LogOut),

  cake: createIconComponent(CakeSlice),
  plus: createIconComponent(Plus),
  minus: createIconComponent(Minus),

  trendingUp: createIconComponent(TrendingUp),
  trendingDown: createIconComponent(TrendingDown),

  lightMode: createIconComponent(Sun),
  darkMode: createIconComponent(Moon),

  chevronDown: createIconComponent(ChevronDown),
  chevronRight: createIconComponent(ChevronRight),
  chevronLeft: createIconComponent(ChevronLeft),

  close: createIconComponent(X),

  dotsHorizontal: createIconComponent(MoreHorizontal),
  bell: createIconComponent(Bell),
  alert: createIconComponent(AlertTriangle),
  trash: createIconComponent(Trash2),

  calendar: createIconComponent(Calendar),
  droplets: createIconComponent(Droplets),
  camera: createIconComponent(Camera),
  subscription: createIconComponent(Sparkle),
  billing: createIconComponent(CreditCard),
  stats: createIconComponent(ChartNoAxesCombined),
} as const;

export const VEHICLE_TYPE_ICONS: Record<string, LucideIcon> = {
  car: Car,
  motorcycle: Bike,
  boat: Ship,
  other: Cog,
};

const getVehicleTypeIcon = (type: string): LucideIcon => {
  return VEHICLE_TYPE_ICONS[type] || VEHICLE_TYPE_ICONS.other!;
};

export function VehicleTypeIcon({
  type,
  className,
  size,
  color,
  strokeWidth,
  disabled,
}: { type: TVehicleTypeCode } & IconProps) {
  const Icon = getVehicleTypeIcon(type);
  return (
    <Icon class={cn(iconSizes[size || "md"], className)} color={color} strokeWidth={strokeWidth} />
  );
}

// Type exports
export type IconName = keyof typeof Icons;
export type { IconProps };
