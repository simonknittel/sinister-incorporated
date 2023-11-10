"use client";

// @refresh reset

import { PresentationControls, SpotLight } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { Leva, folder, useControls } from "leva";
import { ArcadeMachine } from "./models/ArcadeMachine";
import { Player } from "./models/Player";
import { Wall } from "./models/Wall";

const Game = () => {
  const {
    offset,
    darkness,
    luminanceThreshold,
    luminanceSmoothing,
    height,
    arcadeMachinePosition,
    spotLightPosition,
    distance,
    angle,
    attenuation,
    anglePower,
    intensity,
  } = useControls({
    vignette: folder({
      offset: 0,
      darkness: 1,
    }),
    bloom: folder({
      luminanceThreshold: 0,
      luminanceSmoothing: 0.9,
      height: 300,
    }),
    arcadeMachine: folder({
      arcadeMachinePosition: [0, -4.2, 3],
    }),
    spotLight: folder({
      spotLightPosition: [10, 10, 10],
      distance: 5,
      angle: 0.15,
      attenuation: 5,
      anglePower: 5,
      intensity: 1,
    }),
  });

  return (
    <>
      <Canvas>
        <SpotLight
          position={spotLightPosition}
          distance={distance}
          angle={angle}
          attenuation={attenuation}
          anglePower={anglePower}
          intensity={intensity}
        />

        {/* <Environment preset="apartment" /> */}

        <PresentationControls
          snap
          global
          zoom={0}
          rotation={[0, 0, 0]}
          polar={[-0.1, 0]}
          azimuth={[-0.1, 0.1]}
        >
          <Wall />

          <ArcadeMachine position={arcadeMachinePosition} />

          <Player position={[1, 1, 1]} />
        </PresentationControls>

        <EffectComposer>
          <Bloom
            luminanceThreshold={luminanceThreshold}
            luminanceSmoothing={luminanceSmoothing}
            height={height}
          />
          <Vignette offset={offset} darkness={darkness} />
          <Noise premultiply />
        </EffectComposer>
      </Canvas>

      <Leva />
    </>
  );
};

export default Game;

/**
 * https://pmndrs.github.io/postprocessing/public/demo/#glitch
 * https://pmndrs.github.io/postprocessing/public/demo/#pattern
 */
