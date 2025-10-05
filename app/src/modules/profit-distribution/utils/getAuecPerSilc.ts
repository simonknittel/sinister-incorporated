export const getAuecPerSilc = (auecProfit: number, totalSilc: number) => {
  return totalSilc > 0 ? Math.round(auecProfit / totalSilc) : 0;
};
