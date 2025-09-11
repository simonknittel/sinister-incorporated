const NPC_HANDLES = ["Hazard-00", "StreamingSOC_", "RotationSimple-"];
export const isNpc = (handle: string) =>
  (handle.length >= 27 && handle.split("_").length - 1 >= 2) ||
  NPC_HANDLES.some((NPC_HANDLE) => handle.startsWith(NPC_HANDLE));
