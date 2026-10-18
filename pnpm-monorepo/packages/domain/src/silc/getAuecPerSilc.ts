/**
 * `auecProfit` is a Prisma BigInt column, so callers may hold a bigint; the
 * explicit conversion keeps the division from throwing "Cannot mix BigInt
 * and other types".
 */
export const getAuecPerSilc = (
  auecProfit: number | bigint,
  totalSilc: number,
) => {
  return totalSilc > 0 ? Math.round(Number(auecProfit) / totalSilc) : 0;
};
