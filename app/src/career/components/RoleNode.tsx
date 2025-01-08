"use client";

import { env } from "@/env";
import { FlowNodeRoleImage, type Role } from "@prisma/client";
import {
  Handle,
  NodeResizer,
  NodeToolbar,
  Position,
  useNodeId,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import clsx from "clsx";
import Image from "next/image";
import { useCallback, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { IoMdResize } from "react-icons/io";
import { getBackground } from "../utils/getBackground";

export type RoleNode = Node<
  {
    role: Role;
    roleImage: FlowNodeRoleImage;
    unlocked: boolean;
    backgroundColor: string;
    backgroundTransparency: number;
  },
  "role"
>;

export const RoleNode = (props: NodeProps<RoleNode>) => {
  const nodeId = useNodeId();
  const { setNodes, setEdges } = useReactFlow();
  const [isResizing, setIsResizing] = useState(true);

  const onDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
    setEdges((edges) => edges.filter((edge) => edge.source !== nodeId));
  }, [nodeId, setNodes, setEdges]);

  const backgroundColor = getBackground(
    props.data.backgroundColor,
    props.data.backgroundTransparency,
  );

  const imageSrc =
    props.data.roleImage === FlowNodeRoleImage.THUMBNAIL
      ? `https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${props.data.role.thumbnailId}`
      : `https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${props.data.role.iconId}`;

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
          type="button"
          onClick={() => setIsResizing((value) => !value)}
          className="bg-neutral-800 rounded p-2 text-sinister-red-500 hover:bg-neutral-700"
        >
          <IoMdResize />
        </button>

        <button
          onClick={onDelete}
          type="button"
          title="Löschen"
          className="bg-neutral-800 rounded p-2 text-sinister-red-500 hover:bg-neutral-700"
        >
          <FaTrash />
        </button>
      </NodeToolbar>

      {isResizing && <NodeResizer minWidth={100} minHeight={100} />}

      <div
        className={clsx("bg-neutral-800 rounded h-full p-4", {
          // "grayscale hover:grayscale-0": !props.data.unlocked,
        })}
        style={{
          backgroundColor,
        }}
      >
        <Image
          src={imageSrc}
          alt={props.data.role.name}
          title={props.data.role.name}
          width={100}
          height={100}
          className="object-contain object-center w-full h-full"
        />
      </div>

      <Handle id="left" type="source" position={Position.Left} />
      <Handle id="right" type="source" position={Position.Right} />
      <Handle id="top" type="target" position={Position.Top} />
      <Handle id="bottom" type="source" position={Position.Bottom} />
    </>
  );
};
