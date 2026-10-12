import { BannerClouds } from "@/modules/common/components/BannerClouds";
import { ConfettiCanvas } from "@/modules/common/components/ConfettiCanvas";
import type { ReactNode } from "react";

/**
 * The attribute which tells the occasion of a banner, for the end-to-end
 * tests
 */
export enum GreetingBannerMarker {
  Welcome = "data-welcome-banner",
  Birthday = "data-birthday-banner",
  Seasonal = "data-seasonal-banner",
}

/** Connects the surface with its heading, so that the banner has a name */
const TITLE_ELEMENT_ID = "greeting-banner-title";

/** Milliseconds between two bursts while the banner is in view */
const CONFETTI_INTERVAL = 1600;

/**
 * The banner is a wide but flat box. The particles are therefore slow and
 * fall back fast, so that they stay inside the banner instead of leaving it
 * through its upper edge after a few frames.
 */
const CONFETTI_SHOT = {
  particleCount: 10,
  spread: 70,
  startVelocity: 18,
  gravity: 0.8,
  decay: 0.92,
  scalar: 0.7,
  ticks: 150,
};

/** One shot from each lower corner, both towards the middle of the banner */
const CONFETTI_SHOTS = [
  { ...CONFETTI_SHOT, angle: 60, origin: { x: 0, y: 1 } },
  { ...CONFETTI_SHOT, angle: 120, origin: { x: 1, y: 1 } },
];

export interface GreetingBannerProps {
  readonly marker: GreetingBannerMarker;
  /** The utility of the occasion which paints the colour clouds */
  readonly surfaceClassName: string;
  /** Whether the occasion celebrates with confetti behind the greeting */
  readonly hasConfetti: boolean;
  /** The drawing next to the greeting. It fills the box the banner gives it. */
  readonly ornament: ReactNode;
  readonly title: string;
  readonly body: string;
  /** Shown below the body, for example a button */
  readonly callToAction?: ReactNode;
}

/**
 * A greeting above the tiles of the dashboard. The occasion supplies the
 * surface, the ornament and the wording; see `DashboardGreetingBanner` for
 * the occasion which wins. A greeting is content and not a message of the
 * moment, thus it is no live region.
 *
 * The ornament is larger than the banner is high at its top and rises above
 * its upper edge. The surface is thus a layer of its own below the ornament:
 * the surface clips the confetti and the colour clouds at its round corners,
 * and the ornament stays outside of that clip. The ornament keeps inside the
 * left edge, because on a small viewport the banner reaches the edge of the
 * viewport, and a drawing beyond it would let the page scroll sideways. The
 * text column starts to the right of the ornament, thus the call to action
 * cannot go below the ornament on a small viewport.
 *
 * The ornament stays on every viewport size, because it moves nothing and is
 * the only decoration which small screens also show. It lets every pointer
 * through: a click or a drag of text over the drawing must reach what lies
 * beneath it.
 */
export const GreetingBanner = ({
  marker,
  surfaceClassName,
  hasConfetti,
  ornament,
  title,
  body,
  callToAction,
}: GreetingBannerProps) => (
  <section
    {...{ [marker]: true }}
    aria-labelledby={TITLE_ELEMENT_ID}
    className="relative text-text-primary"
  >
    {/* The surface isolates itself, thus the colour clouds and the confetti
    stay behind the greeting. The clouds lie below the confetti, which paints
    at `-z-10`. The confetti canvas renders nothing for a viewer who prefers
    reduced motion. */}
    <div className="absolute inset-0 isolate overflow-hidden rounded-primary bg-secondary">
      <BannerClouds surfaceClassName={surfaceClassName} className="-z-20" />

      {hasConfetti && (
        <ConfettiCanvas
          shots={CONFETTI_SHOTS}
          intervalMilliseconds={CONFETTI_INTERVAL}
          className="absolute inset-0 -z-10 size-full"
        />
      )}
    </div>

    <div
      aria-hidden
      className="pointer-events-none absolute -top-3 left-3 size-28"
    >
      {ornament}
    </div>

    <div className="relative flex flex-col gap-1 py-6 pr-6 pl-36">
      <h2
        id={TITLE_ELEMENT_ID}
        className="font-mono text-2xl font-thin uppercase"
      >
        {title}
      </h2>

      <p>{body}</p>

      {/* A call to action can render nothing, and then its row must not
      add space below the body */}
      <div className="mt-3 flex empty:hidden">{callToAction}</div>
    </div>
  </section>
);
