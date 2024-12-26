"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import clsx from "clsx";
import Image from "next/image";
import type { ComponentProps } from "react";

export type ImageNode = Node<
  {
    src: ComponentProps<typeof Image>["src"];
    label: string;
    unlocked: boolean;
  },
  "image"
>;

export const ImageNode = (props: NodeProps<ImageNode>) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />

      <div
        className={clsx({
          "grayscale hover:grayscale-0": !props.data.unlocked,
        })}
      >
        <Image
          src={props.data.src}
          alt={props.data.label}
          title={props.data.label}
          width={200}
          height={200}
        />
      </div>

      <Handle type="source" position={Position.Bottom} />
    </>
  );
};
