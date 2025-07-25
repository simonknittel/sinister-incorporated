"use client";

import { Handles } from "@/career/components/Handles";
import { CitizenLink } from "@/common/components/CitizenLink";
import { SingleRole } from "@/roles/components/SingleRole";
import {
  FlowNodeRoleCitizensAlignment,
  FlowNodeType,
  type Role,
  type Upload,
} from "@prisma/client";
import {
  applyNodeChanges,
  NodeResizer,
  NodeToolbar,
  Position,
  useNodeId,
  useReactFlow,
  type NodeProps,
  type Node as NodeType,
} from "@xyflow/react";
import clsx from "clsx";
import {
  useCallback,
  useState,
  type ComponentType,
  type FormEventHandler,
} from "react";
import toast from "react-hot-toast";
import { FaPen } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { IoMdResize } from "react-icons/io";
import { CreateOrUpdateNodeModal } from "../../../components/CreateOrUpdateNodeModal";
import { useFlowContext } from "../../../components/FlowContext";
import { getBackground } from "../../../utils/getBackground";
import type { AdditionalDataType } from "./additionalDataType";
import { schema } from "./schema";

export type RoleNode = NodeType<
  | {
      redacted: true;
    }
  | {
      role: Role & {
        icon: Upload | null;
        thumbnail: Upload | null;
      };
      roleCitizensAlignment: FlowNodeRoleCitizensAlignment;
      roleCitizensHideRole: boolean;
      backgroundColor: string;
      backgroundTransparency: number;
      unlocked: boolean;
    },
  typeof FlowNodeType.ROLE_CITIZENS
>;

export const Node: ComponentType<NodeProps<RoleNode>> = (props) => {
  const { isUpdating, additionalData } = useFlowContext();
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
      const result = schema.safeParse({
        id: formData.get("id"),
        nodeType: formData.get("nodeType"),
        roleId: formData.get("roleId"),
        roleCitizensAlignment: formData.get("roleCitizensAlignment"),
        roleCitizensHideRole: formData.get("roleCitizensHideRole"),
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

      const role = (additionalData as AdditionalDataType).roles.find(
        (role) => role.id === result.data.roleId,
      );
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
                  roleCitizensAlignment: result.data.roleCitizensAlignment,
                  roleCitizensHideRole: result.data.roleCitizensHideRole,
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
    [additionalData, setNodes, props],
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
            className="bg-neutral-800 rounded-secondary p-2 text-sinister-red-500 hover:bg-neutral-700"
          >
            <IoMdResize />
          </button>

          <button
            onClick={onEdit}
            type="button"
            title="Bearbeiten"
            className="bg-neutral-800 rounded-secondary p-2 text-sinister-red-500 hover:bg-neutral-700"
          >
            <FaPen />
          </button>

          {isEditModalOpen && "role" in props.data && (
            <CreateOrUpdateNodeModal
              onRequestClose={onEdit}
              initialData={{
                id: props.id,
                type: FlowNodeType.ROLE_CITIZENS,
                roleId: props.data.role.id,
                roleCitizensAlignment: props.data.roleCitizensAlignment,
                roleCitizensHideRole: props.data.roleCitizensHideRole,
                backgroundColor: props.data.backgroundColor,
                backgroundTransparency: props.data.backgroundTransparency,
              }}
              onUpdate={onUpdate}
            />
          )}

          <button
            onClick={onDelete}
            type="button"
            title="Löschen"
            className="bg-neutral-800 rounded-secondary p-2 text-sinister-red-500 hover:bg-neutral-700"
          >
            <FaTrash />
          </button>
        </NodeToolbar>
      )}

      {isResizing && <NodeResizer minWidth={100} minHeight={100} />}

      <div
        className={clsx("bg-neutral-800 rounded-secondary h-full p-4", {
          "grayscale opacity-40 hover:grayscale-0 hover:opacity-100": !unlocked,
          "opacity-40 grayscale-0": "redacted" in props.data,
          "flex justify-center":
            !("roleCitizensAlignment" in props.data) ||
            ("roleCitizensAlignment" in props.data &&
              (!props.data.roleCitizensAlignment ||
                props.data.roleCitizensAlignment ===
                  FlowNodeRoleCitizensAlignment.CENTER)),
        })}
        style={{
          backgroundColor,
        }}
      >
        {"role" in props.data && (
          <div
            className={clsx("flex gap-4", {
              "flex-col items-center":
                !props.data.roleCitizensAlignment ||
                props.data.roleCitizensAlignment ===
                  FlowNodeRoleCitizensAlignment.CENTER,
              "flex-row items-start":
                props.data.roleCitizensAlignment ===
                FlowNodeRoleCitizensAlignment.LEFT,
            })}
          >
            {!props.data.roleCitizensHideRole && (
              <SingleRole
                role={props.data.role}
                className="text-white flex-none"
              />
            )}

            <div
              className={clsx("flex flex-wrap gap-x-4 gap-y-2 text-lg", {
                "justify-start":
                  props.data.roleCitizensAlignment ===
                  FlowNodeRoleCitizensAlignment.LEFT,
                "justify-center":
                  !props.data.roleCitizensAlignment ||
                  props.data.roleCitizensAlignment ===
                    FlowNodeRoleCitizensAlignment.CENTER,
              })}
            >
              {(
                additionalData as AdditionalDataType
              ).citizensGroupedByVisibleRoles
                .get(props.data.role.id)
                ?.citizens.map((citizen) => (
                  <CitizenLink
                    key={citizen.id}
                    citizen={citizen}
                    className="py-[0.125rem]"
                  />
                ))}
            </div>
          </div>
        )}

        {"redacted" in props.data && (
          <p className="text-sinister-red-500 font-bold border border-sinister-red-500 rounded-secondary px-2 py-1 inline-block text-xs">
            Redacted
          </p>
        )}
      </div>

      <Handles isUpdating={isUpdating} />
    </>
  );
};
