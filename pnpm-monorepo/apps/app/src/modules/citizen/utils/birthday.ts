/**
 * The texts of a birthday. A birthday has a day and a month without a year
 * (see `getCelebrationDate` of the domain package for the rule).
 */

/**
 * A leap year, so that February 29 can be formatted. The year is never
 * shown, and UTC keeps the date from moving across a day boundary.
 */
const FORMATTING_YEAR = 2000;

const toFormattableDate = (day: number, month: number) =>
  new Date(Date.UTC(FORMATTING_YEAR, month - 1, day));

const birthdayFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export const formatBirthday = (day: number, month: number) =>
  birthdayFormatter.format(toFormattableDate(day, month));

const monthFormatter = new Intl.DateTimeFormat("de-DE", {
  month: "long",
  timeZone: "UTC",
});

export const getMonthName = (month: number) =>
  monthFormatter.format(toFormattableDate(1, month));
