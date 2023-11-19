"use client";

import Script from "next/script";
import { useRef } from "react";

// @refresh reset

const buildUrl = "/meet-the-care-bears-assets/Build";

const config = {
  dataUrl: buildUrl + "/Build.data.br",
  frameworkUrl: buildUrl + "/Build.framework.js.br",
  codeUrl: buildUrl + "/Build.wasm.br",
  streamingAssetsUrl: "StreamingAssets",
  companyName: "Simon Knittel",
  productName: "Meet the Care Bears",
  productVersion: "0.1.0",
  showBanner: () => {},
};

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleLoad = () => {
    window
      .createUnityInstance(canvasRef.current, config)
      .then((unityInstance) => {
        unityInstance.SetFullscreen(1);
      })
      .catch((message) => {
        alert(message);
      });
  };

  return (
    <>
      <canvas ref={canvasRef} width={960} height={600} tabIndex={-1} />
      <Script src={`${buildUrl}/Build.loader.js`} onLoad={handleLoad} />
    </>
  );
};

export default Game;
