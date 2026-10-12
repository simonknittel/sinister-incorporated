import type { GreetingWordingFactory } from "@/modules/dashboard/utils/greetingWordings";
import type { LocalDate, SeasonalEventKey } from "@sam-monorepo/domain";
import type { ReactNode } from "react";

/** A font of a seasonal event, as the theme root of a page applies it */
export interface SeasonalFont {
  /** Class name which defines the CSS variable of the font on an element */
  readonly variableClassName: string;
  /** Name of the CSS variable which the class defines */
  readonly cssVariableName: string;
}

export interface SeasonalDecorationProps {
  readonly className?: string;
}

/**
 * A decoration of a seasonal event. Every decoration is a server component
 * and draws an inline SVG or shows a static SVG file; the caller sizes it
 * through the class name.
 */
export type SeasonalDecorationComponent = (
  props: SeasonalDecorationProps,
) => ReactNode;

/** Everything the app draws for one seasonal event */
export interface SeasonalTheme {
  /** German name of the event, for example "Halloween" */
  readonly title: string;
  readonly font: SeasonalFont;
  /** The pool the greeting banner picks a wording from on every render */
  readonly wordings: readonly GreetingWordingFactory[];
  /** Utility class of the surface of the greeting banner */
  readonly bannerSurfaceClassName: string;
  /**
   * Whether the event celebrates with the confetti canvas on its greeting
   * days, behind the surface of the banner and behind the login page. Only
   * the turn of the year gets it; the other events keep a still surface.
   */
  readonly hasConfetti: boolean;
  /** Drawn inside the top bar, on large viewports only */
  readonly TopBarDecoration: SeasonalDecorationComponent;
  /** Drawn in the layer above the page, on large viewports only */
  readonly ViewportDecoration: SeasonalDecorationComponent;
  /**
   * Drawn on the SpyNet search tile of the dashboard, on large viewports
   * only. The box of the slot is the tile, thus a drawing can stand on its
   * upper edge.
   */
  readonly SpynetSearchTileDecoration: SeasonalDecorationComponent;
  /** Drawn inside the greeting banner, on the greeting days */
  readonly HeroOrnament: SeasonalDecorationComponent;
}

/** The theme of the moment, as the resolution query returns it */
export interface SeasonalThemeResolution {
  readonly event: SeasonalEventKey;
  readonly theme: SeasonalTheme;
  /** The date the theme was resolved for, in the time zone of the viewer */
  readonly localDate: LocalDate;
  /** Whether the event shows its greeting banner on that date */
  readonly isGreetingDay: boolean;
}
