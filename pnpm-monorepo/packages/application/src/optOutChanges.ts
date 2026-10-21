/** The keys of opt-out settings that a save switches on and off */
export interface OptOutChanges<Key> {
  readonly enabled: Key[];
  readonly disabled: Key[];
}

/**
 * The changes of a save of opt-out settings: a row switches its key off, and
 * a key without a row is switched on. The save sends the keys that are
 * switched on. Both lists keep the order of `allKeys`.
 */
export const findOptOutChanges = <Key>(
  allKeys: readonly Key[],
  enabledKeys: Pick<ReadonlySet<Key>, "has">,
  switchedOffKeys: Pick<ReadonlySet<Key>, "has">,
): OptOutChanges<Key> => ({
  enabled: allKeys.filter(
    (key) => enabledKeys.has(key) && switchedOffKeys.has(key),
  ),
  disabled: allKeys.filter(
    (key) => !enabledKeys.has(key) && !switchedOffKeys.has(key),
  ),
});
