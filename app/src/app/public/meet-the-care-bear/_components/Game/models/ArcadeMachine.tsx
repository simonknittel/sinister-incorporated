import { useLoader, type ThreeElements } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export const ArcadeMachine = (
  props: Omit<ThreeElements["primitive"], "object">,
) => {
  const gltf = useLoader(
    GLTFLoader,
    "/meet-the-care-bear/rusty_japanese_arcade/scene.gltf",
  );

  return <primitive {...props} object={gltf.scene} />;
};
