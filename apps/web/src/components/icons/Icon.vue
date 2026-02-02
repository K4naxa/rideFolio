<script setup lang="ts">
import { computed } from "vue";
import type { HTMLAttributes } from "vue";
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
  UserLock,
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
  OctagonAlert,
  Sparkle,
  ShieldCheckIcon,
  ToolCaseIcon,
  FileText,
  ArrowUpIcon,
  WrenchIcon,
  CarFront,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Sun,
  KeyIcon,
  Moon,
  Edit,
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
  FilterIcon,
  Pin,
  PinOff,
  CheckIcon,
  ShieldIcon,
  LinkIcon,
  SaveIcon,
  Circle,
  CircleCheck,
  GaugeIcon,
  ArrowLeftIcon,
  type LucideIcon,
  RouteIcon,
  LayoutDashboard,
  RotateCcwIcon,
  DatabaseIcon,
  Settings2Icon,
} from "lucide-vue-next";
import { twMerge } from "tailwind-merge";
import TooltipTrigger from "../ui/tooltip/TooltipTrigger.vue";
import Tooltip from "../ui/tooltip/Tooltip.vue";
import TooltipContent from "../ui/tooltip/TooltipContent.vue";

type IconSize = "sm" | "md" | "lg" | "xl" | "2xl";

type IconName =
  | "car"
  | "carFront"
  | "check"
  | "shield"
  | "motorcycle"
  | "boat"
  | "key"
  | "otherVehicle"
  | "hash"
  | "vehicleMake"
  | "otherInfo"
  | "filter"
  | "odoHours"
  | "odoDistance"
  | "toolcase"
  | "arrowUp"
  | "shieldCheck"
  | "fileText"
  | "wrench"
  | "pin"
  | "edit"
  | "pinOff"
  | "refill"
  | "maintenance"
  | "notes"
  | "todo"
  | "shoppingCart"
  | "user"
  | "users"
  | "userLock"
  | "userPlus"
  | "home"
  | "settings"
  | "search"
  | "files"
  | "mail"
  | "logout"
  | "cake"
  | "plus"
  | "minus"
  | "trendingUp"
  | "trendingDown"
  | "lightMode"
  | "darkMode"
  | "error"
  | "chevronDown"
  | "chevronRight"
  | "chevronLeft"
  | "arrowLeft"
  | "close"
  | "dotsHorizontal"
  | "bell"
  | "alert"
  | "trash"
  | "calendar"
  | "droplets"
  | "consumption"
  | "camera"
  | "subscription"
  | "billing"
  | "stats"
  | "link"
  | "save"
  | "distance"
  | "circle"
  | "overview"
  | "retry"
  | "database"
  | "preferences"
  | "circleCheck";

export interface IconProps {
  name: IconName;
  size?: IconSize;
  class?: HTMLAttributes["class"];
  tooltip?: string;
}

const props = withDefaults(defineProps<IconProps>(), {
  size: "md",
});

const iconSizes: Record<IconSize, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-7 h-7",
  "2xl": "w-8 h-8",
};

const iconMap: Record<IconName, LucideIcon> = {
  car: Car,
  carFront: CarFront,
  check: CheckIcon,
  motorcycle: Bike,
  boat: Ship,
  shield: ShieldIcon,
  otherVehicle: Cog,
  hash: Hash,
  vehicleMake: Building,
  key: KeyIcon,
  otherInfo: NotebookPen,
  filter: FilterIcon,
  odoHours: Clock,
  odoDistance: Gauge,
  pin: Pin,
  pinOff: PinOff,
  refill: Fuel,
  maintenance: Wrench,
  consumption: GaugeIcon,
  notes: StickyNote,
  todo: ListCheck,
  shoppingCart: ShoppingCart,
  user: User,
  users: Users,
  userLock: UserLock,
  userPlus: UserPlus,
  home: Home,
  settings: Settings,
  search: Search,
  files: Files,
  mail: Mail,
  logout: LogOut,
  cake: CakeSlice,
  plus: Plus,
  minus: Minus,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  lightMode: Sun,
  darkMode: Moon,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  close: X,
  dotsHorizontal: MoreHorizontal,
  bell: Bell,
  alert: AlertTriangle,
  trash: Trash2,
  calendar: Calendar,
  droplets: Droplets,
  camera: Camera,
  subscription: Sparkle,
  billing: CreditCard,
  stats: ChartNoAxesCombined,
  link: LinkIcon,
  toolcase: ToolCaseIcon,
  arrowUp: ArrowUpIcon,
  shieldCheck: ShieldCheckIcon,
  fileText: FileText,
  wrench: WrenchIcon,
  error: OctagonAlert,
  save: SaveIcon,
  edit: Edit,
  circle: Circle,
  circleCheck: CircleCheck,
  arrowLeft: ArrowLeftIcon,
  distance: RouteIcon,
  overview: LayoutDashboard,
  retry: RotateCcwIcon,
  database: DatabaseIcon,
  preferences: Settings2Icon,
};

const iconComponent = computed(() => iconMap[props.name]);
const iconClass = computed(() => twMerge(iconSizes[props.size], "stroke-current text-current", props.class));
</script>

<template>
  <Tooltip v-if="props.tooltip && props.name" :delay-duration="300">
    <TooltipTrigger>
      <component :is="iconComponent" :class="iconClass" />
    </TooltipTrigger>
    <TooltipContent>{{ props.tooltip }}</TooltipContent>
  </Tooltip>
  <component v-else-if="props.name" :is="iconComponent" :class="iconClass" />
</template>
