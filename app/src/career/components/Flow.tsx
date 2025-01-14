"use client";

import Note from "@/common/components/Note";
import {
  FlowNodeRoleImage,
  FlowNodeType,
  type FlowEdge,
  type FlowNode,
  type Flow as FlowPrisma,
  type Role,
} from "@prisma/client";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  ControlButton,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { unstable_rethrow, useRouter } from "next/navigation";
import {
  useCallback,
  useState,
  useTransition,
  type FormEventHandler,
  type MouseEventHandler,
} from "react";
import toast from "react-hot-toast";
import { FaPen, FaSave, FaSpinner } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { updateFlow } from "../actions/updateFlow";
import { getInitialNodesAndEdges } from "../utils/getInitialNodesAndEdges";
import { nodeTypes } from "../utils/nodeTypes";
import { CreateOrUpdateNodeModal, schema } from "./CreateOrUpdateNodeModal";
import { FlowProvider } from "./FlowContext";

type Props = Readonly<{
  className?: string;
  flow: FlowPrisma & {
    nodes: (FlowNode & {
      sources: FlowEdge[];
      targets: FlowEdge[];
    })[];
  };
  roles: Role[];
  assignedRoles: (Role & {
    inherits: Role[];
  })[];
  canUpdate?: boolean;
  isUpdating?: boolean;
}>;

export const Flow = ({
  className,
  flow,
  roles,
  canUpdate = false,
  isUpdating = false,
  assignedRoles,
}: Props) => {
  const { initialNodes, initialEdges } = getInitialNodesAndEdges(
    flow,
    roles,
    assignedRoles,
  );

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isCreateNodeModalOpen, setIsCreateNodeModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [unsaved, setUnsaved] = useState(false);

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    console.log("node changes", changes);
    if (
      changes.some((change) => {
        if (change.type === "select") return false;
        if (change.type === "dimensions" && !change.resizing) return false;
        return true;
      })
    )
      setUnsaved(true);
    return setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);
  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    if (changes.some((change) => change.type !== "select")) setUnsaved(true);
    return setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);
  const onConnect: OnConnect = useCallback((params) => {
    setUnsaved(true);
    return setEdges((eds) => addEdge(params, eds));
  }, []);

  const onCreate: FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      event.preventDefault();
      setIsCreateNodeModalOpen(false);

      const formData = new FormData(event.currentTarget);
      const result = schema.safeParse({
        id: formData.get("id"),
        nodeType: formData.get("nodeType"),
        roleId: formData.get("roleId"),
        roleImage: formData.get("roleImage"),
        markdown: formData.get("markdown"),
        markdownPosition: formData.get("markdownPosition"),
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

      setUnsaved(true);

      setNodes((nds) => {
        if (result.data.nodeType === FlowNodeType.ROLE) {
          const data = result.data;
          const role = roles.find((role) => role.id === data.roleId);
          return applyNodeChanges(
            [
              {
                type: "add",
                item: {
                  id: data.id,
                  type: FlowNodeType.ROLE,
                  position: {
                    x: 0,
                    y: 0,
                  },
                  width:
                    data.roleImage === FlowNodeRoleImage.THUMBNAIL ? 178 : 100,
                  height: 100,
                  data: {
                    role,
                    roleImage: data.roleImage,
                    backgroundColor: data.backgroundColor,
                    backgroundTransparency: data.backgroundTransparency,
                  },
                },
              },
            ],
            nds,
          );
        } else if (result.data.nodeType === FlowNodeType.MARKDOWN) {
          const data = result.data;
          return applyNodeChanges(
            [
              {
                type: "add",
                item: {
                  id: data.id,
                  type: FlowNodeType.MARKDOWN,
                  position: {
                    x: 0,
                    y: 0,
                  },
                  width: 178,
                  height: 316,
                  data: {
                    markdown: data.markdown,
                    markdownPosition: data.markdownPosition,
                    backgroundColor: data.backgroundColor,
                    backgroundTransparency: data.backgroundTransparency,
                  },
                },
              },
            ],
            nds,
          );
        }

        throw new Error("Invalid node type");
      });
    },
    [roles],
  );

  const onSave: MouseEventHandler<HTMLButtonElement> = useCallback(() => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("flowId", flow.id);
        formData.append("nodes", JSON.stringify(nodes));
        formData.append("edges", JSON.stringify(edges));

        const result = await updateFlow(formData);

        if (result.error) {
          toast.error(result.error);
          console.error(result.error);
          return;
        }

        setUnsaved(false);
        toast.success(result.success);
      } catch (error) {
        unstable_rethrow(error);
        toast.error(
          "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
        );
        console.error(error);
      }
    });
  }, [flow.id, nodes, edges]);

  const onToggleUpdating: MouseEventHandler<HTMLButtonElement> =
    useCallback(() => {
      if (isUpdating) {
        document.cookie = `is_updating_flow=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
      } else {
        document.cookie = `is_updating_flow=${flow.id}; path=/`;
      }

      router.refresh();
    }, [isUpdating, flow.id, router]);

  return (
    <FlowProvider roles={roles} isUpdating={isUpdating}>
      {unsaved && (
        <Note
          type="info"
          className="absolute left-1/2 -translate-x-1/2 top-4 z-10 text-blue-500"
          message="Ungespeicherte Änderungen"
        />
      )}

      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className={className}
        defaultEdgeOptions={{
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        }}
        snapToGrid
        nodesDraggable={isUpdating}
        nodesConnectable={isUpdating}
        nodesFocusable={isUpdating}
        edgesFocusable={isUpdating}
        colorMode="dark"
        minZoom={0.25}
      >
        <Background color="#444" variant={BackgroundVariant.Dots} />

        <Controls position="top-left" showInteractive={false}>
          {canUpdate && (
            <>
              <ControlButton
                onClick={onToggleUpdating}
                title="Bearbeiten de-/aktivieren"
              >
                <FaPen />
              </ControlButton>

              {isUpdating && (
                <>
                  <ControlButton
                    onClick={() => setIsCreateNodeModalOpen(true)}
                    title="Element hinzufügen"
                  >
                    <FaPlus />
                  </ControlButton>

                  <ControlButton onClick={onSave} title="Speichern">
                    {isPending ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaSave />
                    )}
                  </ControlButton>
                </>
              )}
            </>
          )}
        </Controls>
      </ReactFlow>

      {isCreateNodeModalOpen && (
        <CreateOrUpdateNodeModal
          onRequestClose={() => setIsCreateNodeModalOpen(false)}
          onSubmit={onCreate}
        />
      )}
    </FlowProvider>
  );
};
