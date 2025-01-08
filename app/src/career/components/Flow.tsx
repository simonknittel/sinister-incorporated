"use client";

import { createId } from "@paralleldrive/cuid2";
import {
  FlowNodeRoleImage,
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
import { unstable_rethrow } from "next/navigation";
import {
  useCallback,
  useState,
  useTransition,
  type FormEventHandler,
  type MouseEventHandler,
} from "react";
import toast from "react-hot-toast";
import { FaSave, FaSpinner } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { z } from "zod";
import { updateFlow } from "../actions/updateFlow";
import { getInitialNodesAndEdges } from "../utils/getInitialNodesAndEdges";
import { nodeTypes } from "../utils/nodeTypes";
import { CreateNodeModal } from "./CreateNodeModal";

const schema = z.discriminatedUnion("nodeType", [
  z.object({
    nodeType: z.literal("role"),
    roleId: z.string(),
    roleImage: z.nativeEnum(FlowNodeRoleImage),
    backgroundColor: z.string(),
    backgroundTransparency: z.coerce.number().min(0).max(1),
  }),
  z.object({
    nodeType: z.literal("image"),
    backgroundColor: z.string(),
    backgroundTransparency: z.coerce.number().min(0).max(1),
  }),
]);

type Props = Readonly<{
  className?: string;
  flow: FlowPrisma & {
    nodes: (FlowNode & {
      sources: FlowEdge[];
      targets: FlowEdge[];
    })[];
  };
  roles: Role[];
}>;

export const Flow = ({ className, flow, roles }: Props) => {
  const { initialNodes, initialEdges } = getInitialNodesAndEdges(flow, roles);

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isCreateNodeModalOpen, setIsCreateNodeModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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
        nodeType: formData.get("nodeType"),
        roleId: formData.get("roleId"),
        roleImage: formData.get("roleImage"),
        backgroundColor: formData.get("backgroundColor"),
        backgroundTransparency: formData.get("backgroundTransparency"),
      });

      if (!result.success) {
        toast.error(
          "Beim Hinzufügen ist ein unerwarteter Fehler aufgetreten. Bitte versuche es später erneut.",
        );
        console.error(result.error);
        return;
      }

      if (result.data.nodeType === "role") {
        // @ts-expect-error Don't know how to fix this
        const role = roles.find((role) => role.id === result.data.roleId);
        if (!role) {
          toast.error(
            "Beim Hinzufügen ist ein unerwarteter Fehler aufgetreten. Bitte versuche es später erneut.",
          );
          return;
        }

        setNodes((nds) => {
          // I don't know why this is required here if we are already checking this some lines above
          if (result.data.nodeType !== "role")
            throw new Error("Invalid node type");

          return applyNodeChanges(
            [
              {
                type: "add",
                item: {
                  id: createId(),
                  type: "role",
                  position: {
                    x: 0,
                    y: 0,
                  },
                  width: 100,
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
        console.log(nodes);
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

  // TODO: Map over nodes and add unlocked property

  return (
    <>
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
      >
        <Background color="#444" variant={BackgroundVariant.Dots} />

        <Controls position="top-left">
          <ControlButton
            onClick={() => setIsCreateNodeModalOpen(true)}
            title="Element hinzufügen"
          >
            <FaPlus />
          </ControlButton>

          <ControlButton onClick={onSave} title="Speichern">
            {isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
          </ControlButton>
        </Controls>
      </ReactFlow>

      {isCreateNodeModalOpen && (
        <CreateNodeModal
          onRequestClose={() => setIsCreateNodeModalOpen(false)}
          onSubmit={onCreate}
          roles={roles}
        />
      )}
    </>
  );
};
