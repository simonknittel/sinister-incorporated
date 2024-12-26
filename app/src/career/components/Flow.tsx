import certificateBootsOnTheGround from "@/career/assets/certificate-boots-on-the-ground.png";
import certificateDogfight from "@/career/assets/certificate-dogfight.png";
import certificateVehicles from "@/career/assets/certificate-vehicles.png";
import checkByFpsBlue from "@/career/assets/check-by-fps-blue.png";
import element from "@/career/assets/element.png";
import fpsGreen from "@/career/assets/fps-green.png";
import fpsRed from "@/career/assets/fps-red.png";
import { Background, BackgroundVariant, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { type ComponentProps } from "react";
import { ImageNode } from "./ImageNode";

type Props = Readonly<{
  className?: string;
}>;

const initialNodes: ComponentProps<typeof ReactFlow>["nodes"] = [
  {
    id: "element",
    type: "image",
    position: { x: 150, y: 0 },
    data: { label: "Element", src: element, unlocked: true },
  },
  {
    id: "certificate-boots-on-the-ground",
    type: "image",
    position: { x: 0, y: 100 },
    data: {
      label: "Certificate Boots on the Ground",
      src: certificateBootsOnTheGround,
      unlocked: true,
    },
  },
  {
    id: "certificate-dogfight",
    type: "image",
    position: { x: 300, y: 100 },
    data: { label: "Certificate Dogfight", src: certificateDogfight },
  },
  {
    id: "certificate-vehicles",
    type: "image",
    position: { x: 0, y: 400 },
    data: { label: "Certificate Vehicles", src: certificateVehicles },
  },
  {
    id: "fps-green",
    type: "image",
    position: { x: 0, y: 200 },
    data: { label: "FPS - Green", src: fpsGreen, unlocked: true },
  },
  {
    id: "check-by-fps-blue",
    type: "image",
    position: { x: 0, y: 500 },
    data: { label: "Prüfung durch FPS - Blue", src: checkByFpsBlue },
  },
  {
    id: "fps-red",
    type: "image",
    position: { x: 0, y: 600 },
    data: { label: "FPS - Red", src: fpsRed },
  },
];

const initialEdges: ComponentProps<typeof ReactFlow>["edges"] = [
  {
    id: "element_certificate-boots-on-the-ground",
    source: "element",
    target: "certificate-boots-on-the-ground",
  },
  { id: "element-dogfight", source: "element", target: "certificate-dogfight" },
  {
    id: "certificate-boots-on-the-ground_fps-green",
    source: "certificate-boots-on-the-ground",
    target: "fps-green",
  },
  {
    id: "fps-green_certificate-vehicles",
    source: "fps-green",
    target: "certificate-vehicles",
  },
  {
    id: "certificate-vehicles_check-by-fps-blue",
    source: "certificate-vehicles",
    target: "check-by-fps-blue",
  },
  {
    id: "check-by-fps-blue_fps-red",
    source: "check-by-fps-blue",
    target: "fps-red",
  },
];

const nodeTypes = { image: ImageNode };

export const Flow = ({ className }: Props) => {
  return (
    <ReactFlow
      nodes={initialNodes}
      edges={initialEdges}
      nodeTypes={nodeTypes}
      className={className}
    >
      <Background color="#444" variant={BackgroundVariant.Dots} />
    </ReactFlow>
  );
};
