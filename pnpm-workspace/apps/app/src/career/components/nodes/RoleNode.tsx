"use client";

import { env } from "@/env";
import { FlowNodeRoleImage, FlowNodeType, type Role } from "@prisma/client";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  applyNodeChanges,
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
import { useCallback, useState, type FormEventHandler } from "react";
import toast from "react-hot-toast";
import { FaPen } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { IoMdResize } from "react-icons/io";
import { getBackground } from "../../utils/getBackground";
import { CreateOrUpdateNodeModal } from "../CreateOrUpdateNodeModal";
import { useFlowContext } from "../FlowContext";
import styles from "./RoleNode.module.css";
import { roleSchema } from "./roleSchema";

export type RoleNode = Node<
  | {
      redacted: true;
    }
  | {
      role: Role;
      roleImage: FlowNodeRoleImage;
      backgroundColor: string;
      backgroundTransparency: number;
      unlocked: boolean;
    },
  typeof FlowNodeType.ROLE
>;

export const RoleNode = (props: NodeProps<RoleNode>) => {
  const { roles, isUpdating } = useFlowContext();
  const nodeId = useNodeId();
  const { setNodes, setEdges } = useReactFlow();
  const [isResizing, setIsResizing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const onEdit = useCallback(() => {
    setIsEditModalOpen((currentValue) => !currentValue);
  }, []);

  const onUpdate: FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      event.preventDefault();
      setIsEditModalOpen(false);

      const formData = new FormData(event.currentTarget);
      const result = roleSchema.safeParse({
        id: formData.get("id"),
        nodeType: formData.get("nodeType"),
        roleId: formData.get("roleId"),
        roleImage: formData.get("roleImage"),
        backgroundColor: formData.get("backgroundColor"),
        backgroundTransparency: formData.get("backgroundTransparency"),
      });

      if (!result.success) {
        toast.error(
          "Beim Speichern ist ein unerwarteter Fehler aufgetreten. Bitte versuche es später erneut.",
        );
        console.error(result.error);
        return;
      }

      const role = roles.find((role) => role.id === result.data.roleId);
      if (!role) {
        toast.error(
          "Beim Speichern ist ein unerwarteter Fehler aufgetreten. Bitte versuche es später erneut.",
        );
        return;
      }

      setNodes((nds) => {
        return applyNodeChanges(
          [
            {
              type: "replace",
              id: props.id,
              item: {
                id: props.id,
                type: props.type,
                position: {
                  x: props.positionAbsoluteX,
                  y: props.positionAbsoluteY,
                },
                width: props.width,
                height: props.height,
                data: {
                  role,
                  roleImage: result.data.roleImage,
                  backgroundColor: result.data.backgroundColor,
                  backgroundTransparency: result.data.backgroundTransparency,
                },
              },
            },
          ],
          nds,
        );
      });
    },
    [roles, setNodes, props],
  );

  const onDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
    setEdges((edges) =>
      edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    );
  }, [nodeId, setNodes, setEdges]);

  const unlocked = "unlocked" in props.data && props.data.unlocked;

  const backgroundColor =
    "redacted" in props.data
      ? "rgb(38, 38, 38)"
      : getBackground(
          props.data.backgroundColor,
          props.data.backgroundTransparency,
        );

  const imageSrc =
    "redacted" in props.data
      ? null
      : props.data.roleImage === FlowNodeRoleImage.THUMBNAIL
        ? `https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${props.data.role.thumbnailId}`
        : `https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${props.data.role.iconId}`;

  return (
    <>
      {isUpdating && (
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
            onClick={onEdit}
            type="button"
            title="Bearbeiten"
            className="bg-neutral-800 rounded p-2 text-sinister-red-500 hover:bg-neutral-700"
          >
            <FaPen />
          </button>

          {isEditModalOpen && "role" in props.data && (
            <CreateOrUpdateNodeModal
              onRequestClose={onEdit}
              onSubmit={onUpdate}
              initialData={{
                id: props.id,
                type: FlowNodeType.ROLE,
                roleId: props.data.role.id,
                roleImage: props.data.roleImage,
                backgroundColor: props.data.backgroundColor,
                backgroundTransparency: props.data.backgroundTransparency,
              }}
            />
          )}

          <button
            onClick={onDelete}
            type="button"
            title="Löschen"
            className="bg-neutral-800 rounded p-2 text-sinister-red-500 hover:bg-neutral-700"
          >
            <FaTrash />
          </button>
        </NodeToolbar>
      )}

      {isResizing && <NodeResizer minWidth={100} minHeight={100} />}

      <div
        className={clsx(
          "bg-neutral-800 rounded h-full p-4 flex justify-center items-center",
          {
            "grayscale opacity-40 hover:grayscale-0 hover:opacity-100":
              !unlocked,
            "opacity-40 grayscale-0": "redacted" in props.data,
          },
        )}
        style={{
          backgroundColor,
        }}
      >
        {"role" in props.data && (
          <Tooltip.Provider delayDuration={0}>
            <Tooltip.Root>
              <Tooltip.Trigger className="cursor-help w-full h-full">
                <Image
                  src={imageSrc!}
                  alt={props.data.role.name}
                  title={props.data.role.name}
                  width={100}
                  height={100}
                  className="object-contain object-center w-full h-full"
                />
              </Tooltip.Trigger>

              <Tooltip.Content
                className={clsx(
                  "px-2 py-1 text-sm leading-tight select-none rounded bg-sinister-red-500 text-white",
                  styles.TooltipContent,
                )}
                side="top"
                sideOffset={20}
              >
                {props.data.role.name}
                <Tooltip.Arrow className="fill-sinister-red-500" />
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        )}

        {"redacted" in props.data && (
          <p className="text-sinister-red-500 font-bold border border-sinister-red-500 rounded px-2 py-1 inline-block text-xs">
            Redacted
          </p>
        )}
      </div>

      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className={clsx({ "opacity-0": !isUpdating })}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className={clsx({ "opacity-0": !isUpdating })}
      />
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className={clsx({ "opacity-0": !isUpdating })}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className={clsx({ "opacity-0": !isUpdating })}
      />
    </>
  );
};
