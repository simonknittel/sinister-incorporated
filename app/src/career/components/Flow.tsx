"use client";

import { env } from "@/env";
import { createId } from "@paralleldrive/cuid2";
import {
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
import { CreateNodeModal } from "./CreateNodeModal";
import { RoleNode } from "./RoleNode";

const nodeTypes = { role: RoleNode };

const schema = z.discriminatedUnion("nodeType", [
  z.object({
    nodeType: z.literal("role"),
    roleId: z.string(),
  }),
  z.object({
    nodeType: z.literal("image"),
    src: z.string(),
  }),
]);

type Props = Readonly<{
  className?: string;
  flow: FlowPrisma & {
    nodes: FlowNode[];
    edges: FlowEdge[];
  };
  roles: Role[];
}>;

export const Flow = ({ className, flow, roles }: Props) => {
  const initialNodes = flow.nodes.map((node) => {
    let type: keyof typeof nodeTypes;
    switch (node.type) {
      case FlowNodeType.ROLE:
        type = "role";
        break;
      default:
        throw new Error("Invalid node type");
    }

    const role = roles.find((role) => role.id === node.roleId);
    if (!role) throw new Error("Role not found");

    return {
      id: node.id,
      type,
      position: {
        x: node.positionX,
        y: node.positionY,
      },
      data: {
        id: role.id,
        name: role.name,
        imageId: role.imageId,
      },
      measured: {
        width: node.width,
        height: node.height,
      },
    };
  });

  const initialEdges = flow.edges.map((edge) => ({
    id: edge.id,
    type: "step",
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
  }));

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
        src: formData.get("src"),
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
                  data: {
                    id: role.id,
                    name: role.name,
                    imageId: role.imageId,
                    src: `https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${role.imageId}`,
                  },
                },
              },
            ],
            nds,
          );
        });
      }
    },
    [roles],
  );

  const onSave: MouseEventHandler<HTMLButtonElement> = useCallback(() => {
    startTransition(async () => {
      try {
        console.log(edges);
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
          type: "step",
        }}
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
