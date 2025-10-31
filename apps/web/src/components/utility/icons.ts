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
} from "lucide-vue-next"; // ✅ Vue version of lucide-react
import { h, type FunctionalComponent } from "vue";
import type { TVehicleTypeCode } from "@repo/validation"; // adjust path

// ---- Icon size classes ----
export const iconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-7 h-7",
  "2xl": "w-8 h-8",
} as const;

export type IconSize = keyof typeof iconSizes;

export interface IconProps {
  size?: IconSize;
  color?: string;
  class?: string;
  strokeWidth?: number;
  disabled?: boolean;
}

// ---- Helper: create wrapped Lucide components ----
function createIconComponent(LucideIcon: FunctionalComponent<any>) {
  const WrappedIcon: FunctionalComponent<IconProps> = (props) => {
    const { size = "md", color = "currentColor", class: classname = "", strokeWidth = 2 } = props;
    return h(LucideIcon, {
      color,
      strokeWidth,
      class: `${iconSizes[size]} ${classname}`,
    });
  };
  return WrappedIcon;
}

// ---- Custom logo ----
const RideFolioLogo: FunctionalComponent = () =>
  h(
    "svg",
    {
      width: "32",
      height: "32",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
    },
    [
      h("path", {
        d: "M12 2L2 7L12 12L22 7L12 2Z",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
      h("path", {
        d: "M2 17L12 22L22 17",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
      h("path", {
        d: "M2 12L12 17L22 12",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    ],
  );

// ---- Export all icons ----
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

export type IconName = keyof typeof Icons;

const VEHICLE_TYPE_ICONS: Record<string, FunctionalComponent<any>> = {
  car: Car,
  motorcycle: Bike,
  boat: Ship,
  other: Cog,
};

export const getVehicleTypeIcon = (type: string): FunctionalComponent<any> =>
  VEHICLE_TYPE_ICONS[type] ?? VEHICLE_TYPE_ICONS.other!;
