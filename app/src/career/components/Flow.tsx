"use client";

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
  assignedRoles: Role[];
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

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

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

      if (result.data.nodeType === FlowNodeType.ROLE) {
        const role = roles.find((role) => role.id === result.data.roleId);
        if (!role) {
          toast.error(
            "Beim Speichern ist ein unerwarteter Fehler aufgetreten. Bitte versuche es später erneut.",
          );
          return;
        }

        setNodes((nds) => {
          // I don't know why this is required here if we are already checking this some lines above
          if (result.data.nodeType !== FlowNodeType.ROLE)
            throw new Error("Invalid node type");

          return applyNodeChanges(
            [
              {
                type: "add",
                item: {
                  id: result.data.id,
                  type: FlowNodeType.ROLE,
                  position: {
                    x: 0,
                    y: 0,
                  },
                  width:
                    result.data.roleImage === FlowNodeRoleImage.THUMBNAIL
                      ? 178
                      : 100,
                  height: 100,
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
      } else if (result.data.nodeType === "image") {
        // TODO: image
      }
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
        }}
        snapToGrid
        nodesDraggable={isUpdating}
        nodesConnectable={isUpdating}
        nodesFocusable={isUpdating}
        edgesFocusable={isUpdating}
        elementsSelectable={isUpdating}
        colorMode="dark"
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
