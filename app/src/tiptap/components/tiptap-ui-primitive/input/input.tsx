"use client";

import "@/tiptap/components/tiptap-ui-primitive/input/input.scss";
import { cn } from "@/tiptap/lib/tiptap-utils";
import * as React from "react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input type={type} className={cn("tiptap-input", className)} {...props} />
  );
}

function InputGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("tiptap-input-group", className)} {...props}>
      {children}
    </div>
  );
}

export { Input, InputGroup };
