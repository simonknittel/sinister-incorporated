/**
 * Sorts strings and numbers ascending and puts null values last.
 */
export function sortAscWithAndNullLast(
  a?: string | number | null,
  b?: string | number | null,
) {
  if (!a && !b) {
    return 0;
  } else if (!a) {
    return 1;
  } else if (!b) {
    return -1;
  } else {
    if (typeof a === "number" && typeof b === "number") {
      return a - b;
    } else if (typeof a === "string" && typeof b === "string") {
      return a.localeCompare(b);
    }

    return 0;
  }
}

/**
 * Sorts strings and numbers descending and puts null values last.
 */
export function sortDescAndNullLast(
  a?: string | number | null,
  b?: string | number | null,
) {
  if (!a && !b) {
    return 0;
  } else if (!a) {
    return 1;
  } else if (!b) {
    return -1;
  } else {
    if (typeof a === "number" && typeof b === "number") {
      return b - a;
    } else if (typeof a === "string" && typeof b === "string") {
      return b.localeCompare(a);
    }

    return 0;
  }
}
