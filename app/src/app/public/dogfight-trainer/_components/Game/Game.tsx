"use client";

import Script from "next/script";
import { useRef } from "react";

// @refresh reset

const buildUrl = "/dogfight-trainer-assets/Build";

const config = {
  dataUrl: buildUrl + "/Build.data.br",
  frameworkUrl: buildUrl + "/Build.framework.js.br",
  codeUrl: buildUrl + "/Build.wasm.br",
  streamingAssetsUrl: "StreamingAssets",
  companyName: "Simon Knittel",
  productName: "Dogfight Trainer",
  productVersion: "1",
  showBanner: () => {},
};

const Game = () => {
  const canvasId = "unity-canvas";
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleLoad = () => {
    window.createUnityInstance(canvasRef.current, config).catch((message) => {
      alert(message);
    });
  };

  return (
    <>
      <p className="hidden xl:block text-center">Loading ...</p>
      <p className="block xl:hidden text-center">Not available on mobile.</p>

      <canvas
        id={canvasId}
        ref={canvasRef}
        width={960}
        height={600}
        tabIndex={-1}
        className="hidden xl:block absolute inset-0 w-full h-full"
      />

      <Script src={`${buildUrl}/Build.loader.js`} onLoad={handleLoad} />
    </>
  );
};

export default Game;
