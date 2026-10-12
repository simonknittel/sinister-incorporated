"use client";

import { TbRocket } from "react-icons/tb";
import {
  buildConfettiShots,
  NotificationRowDecoration,
} from "./NotificationRowDecoration";

/** Confetti in the teal, blue, green and amber of the surface */
const SHOTS = buildConfettiShots({
  colors: ["#14b8a6", "#3b82f6", "#22c55e", "#f59e0b"],
});

/** The row of a welcome, see `NotificationRowDecoration` */
export const WelcomeDecoration = () => (
  <NotificationRowDecoration
    surfaceClassName="background-welcome"
    shots={SHOTS}
    staticIcon={<TbRocket />}
  />
);
