import { ORGANIZATION_TIMEZONE, wallTimeToInstant } from "@sam-monorepo/domain";
import * as z from "zod";

/** A wall time without an offset, with or without the seconds */
const WALL_TIME_PATTERN = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(?::([0-5]\d))?$/;

const MILLISECONDS_PER_SECOND = 1000;

/**
 * The instant of a wall time in the time zone of the organization. The
 * seconds do not change the offset, thus they are added after the
 * conversion of the minute.
 */
const wallTimeWithSecondsToInstant = (wallTime: string): Date => {
  const match = WALL_TIME_PATTERN.exec(wallTime);
  if (!match?.[1]) throw new Error(`Invalid wall time: ${wallTime}`);

  const instant = wallTimeToInstant(match[1], ORGANIZATION_TIMEZONE);

  return new Date(
    instant.getTime() + Number(match[2] ?? 0) * MILLISECONDS_PER_SECOND,
  );
};

/** The format of `dateTimeInputSchema`, for the descriptions of the fields */
export const DATE_TIME_INPUT_DESCRIPTION = `ISO 8601, for example 2026-10-24T20:00:00+02:00. Without an offset, the time is in ${ORGANIZATION_TIMEZONE}.`;

/**
 * An instant as ISO 8601 with an offset, or a wall time without an offset in
 * the time zone of the organization. The forms of the app send the wall time
 * of a `datetime-local` field, an MCP client can send both. The output is
 * the instant.
 */
export const dateTimeInputSchema = z
  .union([
    z.iso.datetime({ offset: true }),
    z.string().regex(WALL_TIME_PATTERN),
  ])
  .transform((value, context) => {
    if (!WALL_TIME_PATTERN.test(value)) return new Date(value);

    try {
      return wallTimeWithSecondsToInstant(value);
    } catch {
      // For example February 30
      context.addIssue({ code: "custom", message: "Invalid date" });
      return z.NEVER;
    }
  })
  .describe(DATE_TIME_INPUT_DESCRIPTION);
