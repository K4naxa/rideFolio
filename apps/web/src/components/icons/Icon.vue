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
  FilterIcon,
  Pin,
  PinOff,
  CheckIcon,
  type LucideIcon,
} from "lucide-vue-next";
import { twMerge } from "tailwind-merge";

type IconSize = "sm" | "md" | "lg" | "xl" | "2xl";

type IconName =
  | "car"
  | "carFront"
  | "check"
  | "motorcycle"
  | "boat"
  | "otherVehicle"
  | "hash"
  | "vehicleMake"
  | "otherInfo"
  | "filter"
  | "odoHours"
  | "odoDistance"
  | "pin"
  | "pinOff"
  | "refill"
  | "maintenance"
  | "notes"
  | "todo"
  | "shoppingCart"
  | "user"
  | "users"
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
  | "chevronDown"
  | "chevronRight"
  | "chevronLeft"
  | "close"
  | "dotsHorizontal"
  | "bell"
  | "alert"
  | "trash"
  | "calendar"
  | "droplets"
  | "camera"
  | "subscription"
  | "billing"
  | "stats";

export interface IconProps {
  name: IconName;
  size?: IconSize;
  class?: HTMLAttributes["class"];
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
  otherVehicle: Cog,
  hash: Hash,
  vehicleMake: Building,
  otherInfo: NotebookPen,
  filter: FilterIcon,
  odoHours: Clock,
  odoDistance: Gauge,
  pin: Pin,
  pinOff: PinOff,
  refill: Fuel,
  maintenance: Wrench,
  notes: StickyNote,
  todo: ListCheck,
  shoppingCart: ShoppingCart,
  user: User,
  users: Users,
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
};

const iconComponent = computed(() => iconMap[props.name]);
const iconClass = computed(() => twMerge(iconSizes[props.size], props.class));
</script>

<template>
  <component :is="iconComponent" :class="iconClass" />
</template>
