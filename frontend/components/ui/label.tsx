"use client";

import * as React from "react";
import { Label as RadixLabel } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const CustomLabel = React.forwardRef<
  React.ComponentRef<typeof RadixLabel.Root>,
  React.ComponentPropsWithoutRef<typeof RadixLabel.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <RadixLabel.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
CustomLabel.displayName = RadixLabel.Root.displayName;

export { CustomLabel as Label };
