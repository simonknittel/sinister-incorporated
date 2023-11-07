"use client";

import Phaser from "phaser";
import { useEffect } from "react";
import { ExampleScene } from "./scenes/ExampleScene";

/**
 * FYI:
 * https://github.com/photonstorm/phaser/issues/6644
 * I installed `phaser3spectorjs` as workaround.
 */

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 320,
  physics: { default: "arcade" },
  transparent: true,
  Scene: ExampleScene,
};

const Game = () => {
  useEffect(() => {
    const game = new Phaser.Game(config);
    return () => {
      game.destroy(true);
    };
  }, []);

  return null;
};

export default Game;
