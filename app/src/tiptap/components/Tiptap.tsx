"use client";

import clsx from "clsx";
import "./Tiptap.module.css";
import { SimpleEditor } from "./tiptap-templates/simple/simple-editor";

interface Props {
  readonly className?: string;
}

export const Tiptap = ({ className }: Props) => {
  return <SimpleEditor className={clsx(className)} />;
};
