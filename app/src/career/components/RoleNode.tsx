"use client";

import { env } from "@/env";
import type { Role } from "@prisma/client";
import {
  Handle,
  NodeResizer,
  NodeToolbar,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { IoMdResize } from "react-icons/io";

export type RoleNode = Node<
  {
    id: Role["id"];
    name: Role["name"];
    imageId: Role["imageId"];
    unlocked: boolean;
  },
  "role"
>;

export const RoleNode = (props: NodeProps<RoleNode>) => {
  const [isResizing, setIsResizing] = useState(true);

  return (
    <>
      <NodeToolbar
        isVisible={true}
        position={Position.Right}
        align="start"
        className="flex flex-col gap-2"
      >
        <button
          title="Größe ändern"
          onClick={() => setIsResizing((value) => !value)}
          className="bg-neutral-800 rounded p-2 text-sinister-red-500 hover:bg-neutral-700"
        >
          <IoMdResize />
        </button>

        <button
          title="Löschen"
          className="bg-neutral-800 rounded p-2 text-sinister-red-500 hover:bg-neutral-700"
        >
          <FaTrash />
        </button>
      </NodeToolbar>

      {isResizing && <NodeResizer minWidth={100} minHeight={100} />}

      <div
        className={clsx("bg-neutral-800 rounded h-full p-4", {
          "grayscale hover:grayscale-0": !props.data.unlocked,
        })}
      >
        <Image
          src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${props.data.imageId}`}
          alt={props.data.name}
          title={props.data.name}
          width={100}
          height={100}
          className="object-contain object-center w-full h-full"
        />
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};
