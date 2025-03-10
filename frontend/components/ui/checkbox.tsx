"use client";

import * as React from "react";
import { Checkbox as RadixCheckbox } from "radix-ui";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const CustomCheckbox = React.forwardRef<
  React.ComponentRef<typeof RadixCheckbox.Root>, // Usa ComponentRef en lugar de ElementRef
  React.ComponentPropsWithoutRef<typeof RadixCheckbox.Root>
>(({ className, ...props }, ref) => (
  <RadixCheckbox.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className,
    )}
    {...props}
  >
    <RadixCheckbox.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </RadixCheckbox.Indicator>
  </RadixCheckbox.Root>
));
CustomCheckbox.displayName = RadixCheckbox.Root.displayName;

export { CustomCheckbox as Checkbox };
