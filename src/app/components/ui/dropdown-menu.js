"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Content
      ref={ref}
      className={`z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-700 shadow-md ${className}`}
      {...props}
    />
  )
);
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={`cursor-pointer select-none rounded-sm px-3 py-1.5 text-sm hover:bg-gray-100 focus:bg-gray-100 ${className}`}
      {...props}
    />
  )
);
DropdownMenuItem.displayName = "DropdownMenuItem";
