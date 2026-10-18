/**
 * The results must not depend on the time zone of the system. Run this
 * suite with the environment variable TZ set to different zones.
 */

import { describe, expect, test } from "vitest";
import {
  addDaysToLocalDate,
  getLocalDate,
  getLocalDateKey,
  getStartOfLocalDay,
  instantToWallTime,
  ORGANIZATION_TIMEZONE,
  subtractCalendarDays,
  wallTimeToInstant,
} from "./timeZone.js";

const LOS_ANGELES = "America/Los_Angeles";
const TOKYO = "Asia/Tokyo";

describe("wallTimeToInstant", () => {
  test.each([
    ["winter time", "2026-01-15T20:00", "2026-01-15T19:00:00.000Z"],
    ["summer time", "2026-08-16T20:00", "2026-08-16T18:00:00.000Z"],
    ["midnight", "2026-08-16T00:00", "2026-08-15T22:00:00.000Z"],
    [
      "the minute before the gap",
      "2026-03-29T01:59",
      "2026-03-29T00:59:00.000Z",
    ],
    [
      "the first minute after the gap",
      "2026-03-29T03:00",
      "2026-03-29T01:00:00.000Z",
    ],
    [
      "a wall time in the gap, moved forward by one hour",
      "2026-03-29T02:30",
      "2026-03-29T01:30:00.000Z",
    ],
    [
      "the minute before the overlap",
      "2026-10-25T01:59",
      "2026-10-24T23:59:00.000Z",
    ],
    [
      "a wall time in the overlap, the later instant",
      "2026-10-25T02:30",
      "2026-10-25T01:30:00.000Z",
    ],
    [
      "the first minute after the overlap",
      "2026-10-25T03:00",
      "2026-10-25T02:00:00.000Z",
    ],
  ])("Europe/Berlin: %s (%s)", (_description, wallTime, expectedInstant) => {
    expect(
      wallTimeToInstant(wallTime, ORGANIZATION_TIMEZONE).toISOString(),
    ).toBe(expectedInstant);
  });

  test.each([
    [
      "a wall time in the gap, moved forward by one hour",
      "2026-03-08T02:30",
      "2026-03-08T10:30:00.000Z",
    ],
    [
      "a wall time in the overlap, the later instant",
      "2026-11-01T01:30",
      "2026-11-01T09:30:00.000Z",
    ],
  ])(
    "America/Los_Angeles: %s (%s)",
    (_description, wallTime, expectedInstant) => {
      expect(wallTimeToInstant(wallTime, LOS_ANGELES).toISOString()).toBe(
        expectedInstant,
      );
    },
  );

  test.each([
    [
      "America/Santiago",
      "a wall time in the gap at midnight, moved forward by one hour",
      "2026-09-06T00:30",
      "2026-09-06T04:30:00.000Z",
    ],
    [
      "America/Santiago",
      "a wall time in the overlap before midnight, the later instant",
      "2026-04-04T23:30",
      "2026-04-05T03:30:00.000Z",
    ],
    [
      "Australia/Lord_Howe",
      "a wall time in the gap of 30 minutes, moved forward by 30 minutes",
      "2026-10-04T02:15",
      "2026-10-03T15:45:00.000Z",
    ],
    [
      "Asia/Beirut",
      "a wall time in the gap at midnight, moved forward by one hour",
      "2026-03-29T00:30",
      "2026-03-28T22:30:00.000Z",
    ],
  ])("%s: %s (%s)", (timeZone, _description, wallTime, expectedInstant) => {
    expect(wallTimeToInstant(wallTime, timeZone).toISOString()).toBe(
      expectedInstant,
    );
  });

  test("a zone without daylight saving time", () => {
    expect(wallTimeToInstant("2026-08-16T20:00", TOKYO).toISOString()).toBe(
      "2026-08-16T11:00:00.000Z",
    );
  });

  test.each([
    "gestern Abend",
    "2026-02-30T20:00",
    "2026-01-15T24:00",
    "2026-01-15T20:00:30",
    "2026-01-15T20:00Z",
    "2026-01-15T20:00+05:00",
    "0050-01-15T20:00",
  ])("rejects the invalid wall time %s", (wallTime) => {
    expect(() => wallTimeToInstant(wallTime, ORGANIZATION_TIMEZONE)).toThrow(
      "Invalid wall time",
    );
  });

  test("rejects an unknown time zone", () => {
    expect(() => wallTimeToInstant("2026-01-15T20:00", "Mars/Olympus")).toThrow(
      RangeError,
    );
  });
});

describe("instantToWallTime", () => {
  test.each([
    ["winter time", "2026-01-15T19:00:00.000Z", "2026-01-15T20:00"],
    ["summer time", "2026-08-16T18:00:00.000Z", "2026-08-16T20:00"],
    ["midnight", "2026-08-15T22:00:00.000Z", "2026-08-16T00:00"],
    [
      "the earlier instant of the overlap",
      "2026-10-25T00:30:00.000Z",
      "2026-10-25T02:30",
    ],
    [
      "the later instant of the overlap",
      "2026-10-25T01:30:00.000Z",
      "2026-10-25T02:30",
    ],
  ])("Europe/Berlin: %s (%s)", (_description, instant, expectedWallTime) => {
    expect(instantToWallTime(new Date(instant), ORGANIZATION_TIMEZONE)).toBe(
      expectedWallTime,
    );
  });

  test("America/Los_Angeles", () => {
    expect(
      instantToWallTime(new Date("2026-11-01T09:30:00.000Z"), LOS_ANGELES),
    ).toBe("2026-11-01T01:30");
  });

  test.each([
    "2026-01-15T20:00",
    "2026-08-16T20:00",
    "2026-03-29T03:00",
    "2026-10-25T03:00",
  ])("is the inverse of wallTimeToInstant for %s", (wallTime) => {
    expect(
      instantToWallTime(
        wallTimeToInstant(wallTime, ORGANIZATION_TIMEZONE),
        ORGANIZATION_TIMEZONE,
      ),
    ).toBe(wallTime);
  });
});

describe("getLocalDate", () => {
  test("gives the date in the given zone, not in UTC", () => {
    const moment = new Date("2026-08-15T22:30:00.000Z");

    expect(getLocalDate(moment, ORGANIZATION_TIMEZONE)).toEqual({
      year: 2026,
      month: 8,
      day: 16,
    });
    expect(getLocalDate(moment, "UTC")).toEqual({
      year: 2026,
      month: 8,
      day: 15,
    });
  });
});

describe("getLocalDateKey", () => {
  test.each([
    [ORGANIZATION_TIMEZONE, "2026-08-15T21:59:59.999Z", "2026-08-15"],
    [ORGANIZATION_TIMEZONE, "2026-08-15T22:00:00.000Z", "2026-08-16"],
    ["UTC", "2026-08-15T22:00:00.000Z", "2026-08-15"],
    [LOS_ANGELES, "2026-01-01T07:59:59.999Z", "2025-12-31"],
    [TOKYO, "2026-12-31T15:00:00.000Z", "2027-01-01"],
  ])("%s: the day of %s is %s", (timeZone, instant, expectedKey) => {
    expect(getLocalDateKey(new Date(instant), timeZone)).toBe(expectedKey);
  });
});

describe("getStartOfLocalDay", () => {
  test.each([
    ["the day of the spring-forward change", 3, 29, "2026-03-28T23:00:00.000Z"],
    [
      "the day after the spring-forward change",
      3,
      30,
      "2026-03-29T22:00:00.000Z",
    ],
    ["the day of the fall-back change", 10, 25, "2026-10-24T22:00:00.000Z"],
    ["the day after the fall-back change", 10, 26, "2026-10-25T23:00:00.000Z"],
  ])("Europe/Berlin: %s", (_description, month, day, expectedInstant) => {
    expect(
      getStartOfLocalDay(
        { year: 2026, month, day },
        ORGANIZATION_TIMEZONE,
      ).toISOString(),
    ).toBe(expectedInstant);
  });

  test("a midnight in the spring-forward gap gives the end of the gap", () => {
    expect(
      getStartOfLocalDay(
        { year: 2026, month: 9, day: 6 },
        "America/Santiago",
      ).toISOString(),
    ).toBe("2026-09-06T04:00:00.000Z");
  });
});

describe("addDaysToLocalDate", () => {
  test.each([
    [
      "the next day",
      { year: 2026, month: 10, day: 25 },
      1,
      { year: 2026, month: 10, day: 26 },
    ],
    [
      "a month rollover",
      { year: 2026, month: 3, day: 1 },
      -1,
      { year: 2026, month: 2, day: 28 },
    ],
    [
      "a leap day",
      { year: 2028, month: 3, day: 1 },
      -1,
      { year: 2028, month: 2, day: 29 },
    ],
    [
      "a year rollover",
      { year: 2026, month: 1, day: 1 },
      -1,
      { year: 2025, month: 12, day: 31 },
    ],
  ])("%s", (_description, date, days, expectedDate) => {
    expect(addDaysToLocalDate(date, days)).toEqual(expectedDate);
  });
});

/**
 * The expected instants are the results of `Date#setDate(getDate() - days)`
 * in a process with the time zone Europe/Berlin.
 */
describe("subtractCalendarDays", () => {
  test.each([
    [
      "over the spring-forward change, a day of 23 hours",
      "2026-03-29T22:05:00.000Z",
      1,
      "2026-03-28T23:05:00.000Z",
    ],
    [
      "over the fall-back change, a day of 25 hours",
      "2026-10-25T23:05:00.000Z",
      1,
      "2026-10-24T22:05:00.000Z",
    ],
    [
      "into the spring-forward gap, moved forward by one hour",
      "2026-03-30T00:30:00.000Z",
      1,
      "2026-03-29T01:30:00.000Z",
    ],
    [
      "into the fall-back overlap, the earlier instant",
      "2026-10-26T01:30:00.000Z",
      1,
      "2026-10-25T00:30:00.000Z",
    ],
    [
      "a month rollover, with the milliseconds",
      "2026-03-14T23:10:00.123Z",
      30,
      "2026-02-12T23:10:00.123Z",
    ],
    [
      "a year rollover",
      "2025-12-31T23:10:00.000Z",
      30,
      "2025-12-01T23:10:00.000Z",
    ],
  ])("Europe/Berlin: %s", (_description, instant, days, expectedInstant) => {
    expect(
      subtractCalendarDays(
        new Date(instant),
        days,
        ORGANIZATION_TIMEZONE,
      ).toISOString(),
    ).toBe(expectedInstant);
  });
});
