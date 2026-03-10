import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as Button } from "./Button.vue";

export const buttonVariants = cva(
  "inline-flex text-sm font-medium active:scale-98 hover:cursor-pointer items-center justify-center gap-2 select-none whitespace-nowrap rounded-md border border-transparent" +
    " transition-transform duration-100 transition-color disabled:pointer-events-none disabled:opacity-50" +
    " [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0" +
    " outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-1" +
    " aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        menu:
          "text-foreground/80 justify-start active:bg-accent flex w-full items-center gap-3 h-fit! rounded-xl px-4! py-2.5! text-left text-base font-medium" +
          " transition-colors duration-75" +
          " [&_svg]:shrink-0 [&_svg]:size-6!",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/50 dark:hover:bg-input ",
        secondary: "bg-secondary text-secondary-foreground! shadow-xs hover:bg-secondary/80 ",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary font-normal underline-offset-4 hover:underline",
        submit: "bg-primary text-white shadow-xs hover:bg-primary/90 w-full sm:w-auto sm:flex-1 sm:min-w-0 sm:shrink",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
