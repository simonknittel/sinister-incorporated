import { type ThreeElements } from "@react-three/fiber";

export const Wall = (props: ThreeElements["mesh"]) => {
  return (
    <mesh {...props}>
      <planeGeometry args={[160, 90]} />
      <meshStandardMaterial color="lightgray" />
    </mesh>
  );
};
