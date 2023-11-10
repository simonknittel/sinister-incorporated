import { type ThreeElements } from "@react-three/fiber";

export const Player = (props: ThreeElements["mesh"]) => {
  return (
    <mesh {...props}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
};
