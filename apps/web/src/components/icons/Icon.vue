<script setup lang="ts">
import { type HTMLAttributes, ref, useTemplateRef } from "vue";
import { computed } from "vue";
import {
  AlertTriangle,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  Bell,
  Bike,
  Building,
  CakeSlice,
  Calendar,
  Camera,
  Car,
  CarFront,
  ChartNoAxesCombined,
  CheckIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleCheck,
  Clock,
  Cog,
  CreditCard,
  DatabaseIcon,
  Droplets,
  Edit,
  EllipsisVerticalIcon,
  Files,
  FileText,
  FilterIcon,
  Fuel,
  Gauge,
  GaugeIcon,
  Hash,
  HelpCircleIcon,
  Home,
  KeyIcon,
  LayoutDashboard,
  LinkIcon,
  ListCheck,
  LogOut,
  type LucideIcon,
  Mail,
  Minus,
  Moon,
  MoreHorizontal,
  NotebookPen,
  OctagonAlert,
  Pin,
  PinOff,
  Plus,
  RotateCcwIcon,
  RouteIcon,
  SaveIcon,
  Search,
  Settings,
  Settings2Icon,
  ShieldCheckIcon,
  ShieldIcon,
  Ship,
  ShoppingCart,
  Sparkle,
  StickyNote,
  Sun,
  ToolCaseIcon,
  Trash2,
  TrendingDown,
  TrendingUp,
  TvMinimalIcon,
  UndoDotIcon,
  User,
  UserLock,
  UserPlus,
  Users,
  Wrench,
  WrenchIcon,
  X,
} from "lucide-vue-next";
import { twMerge } from "tailwind-merge";
import TooltipTrigger from "../ui/tooltip/TooltipTrigger.vue";
import Tooltip from "../ui/tooltip/Tooltip.vue";
import TooltipContent from "../ui/tooltip/TooltipContent.vue";
import { TooltipProvider } from "@/components/ui/tooltip";
import { onClickOutside } from "@vueuse/core";

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
  | "arrowRight"
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
  | "dotsVertical"
  | "billing"
  | "skipped"
  | "stats"
  | "link"
  | "save"
  | "distance"
  | "circle"
  | "fullRefill"
  | "overview"
  | "retry"
  | "database"
  | "help"
  | "timeline"
  | "preferences"
  | "systemMode"
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
  arrowRight: ArrowRightIcon,
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
  fullRefill: Droplets,
  home: Home,
  timeline: RouteIcon,
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
  skipped: UndoDotIcon,
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
  dotsVertical: EllipsisVerticalIcon,
  retry: RotateCcwIcon,
  database: DatabaseIcon,
  systemMode: TvMinimalIcon,
  preferences: Settings2Icon,
  help: HelpCircleIcon,
};

const iconComponent = computed(() => iconMap[props.name]);
const iconClass = computed(() => twMerge(iconSizes[props.size], "stroke-current text-current", props.class));

const tooltipOpen = ref(false);

const tooltipTriggerRef = useTemplateRef("tooltipTriggerRef");
onClickOutside(tooltipTriggerRef, () => (tooltipOpen.value = false));
</script>

<template>
  <tooltip-provider v-if="props.tooltip && props.name" @click.prevent>
    <Tooltip :delay-duration="300" :open="tooltipOpen" :side-offset="5">
      <TooltipTrigger
        type="button"
        ref="tooltipTriggerRef"
        class="cursor-pointer"
        @click="tooltipOpen = tooltipOpen = true"
        onmouseenter="tooltipOpen = true"
        onmouseleave="tooltipOpen = false"
        onkeydown="
          (e) => e.preventDefault();
          e.key === 'Enter' && (tooltipOpen = !tooltipOpen);
        "
      >
        <component :is="iconComponent" :class="iconClass" />
      </TooltipTrigger>
      <TooltipContent>{{ props.tooltip }}</TooltipContent>
    </Tooltip>
  </tooltip-provider>
  <component v-else-if="props.name" :is="iconComponent" :class="iconClass" />
</template>
