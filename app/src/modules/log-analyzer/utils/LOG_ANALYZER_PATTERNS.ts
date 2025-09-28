export const LOG_ANALYZER_PATTERNS = {
  // <2025-05-27T15:34:52.141Z> [Notice] <Actor Death> CActor::Kill: 'PU_Human-NineTails-Pilot-Male-Light_01_3864128940772' [3864128940772] in zone 'MISC_Prospector_PU_AI_NT_NonLethal_3864128940380' killed by 'ind3x' [202028778295] using 'KLWE_LaserRepeater_S5_3657139981503' [Class unknown] with damage type 'VehicleDestruction' from direction x: 0.000000, y: 0.000000, z: 0.000000 [Team_ActorTech][Actor]
  kill: /^<(?<isoDate>[\d\-T:.Z]+)>.+CActor::Kill.+'(?<target>.*)'.+'(?<zone>.*)'.+'(?<killer>.*)'.+'(?<weapon>.*)'.+'(?<damageType>.*)'.+$/gm,

  // <2025-05-28T22:14:04.694Z> [Notice] <[ActorState] Corpse> [ACTOR STATE][SSCActorStateCVars::LogCorpse] Player 'Test' <remote client>: Running corpsify for corpse. [Team_ActorFeatures][Actor]
  corpse: /^<(?<isoDate>[\d\-T:.Z]+)>.+'(?<target>.*)'.+Running corpsify.+$/gm,

  // <2025-05-28T22:13:34.556Z> [Notice] <[ActorState] Corpse> [ACTOR STATE][SSCActorStateCVars::LogCorpse] Player 'Test' <remote client>: IsCorpseEnabled: Yes, there is no local inventory. [Team_ActorFeatures][Actor]
  // This runs multiple times for some corpses, so we don't use it.
  // corpse2: /^<(?<isoDate>[\d\-T:.Z]+)>.+LogCorpse.+'(?<target>.*)'.+$/gm,

  // <2025-06-22T09:59:12.293Z> [Notice] <Join PU> address[35.187.166.216] port[64336] shard[pub_euw1b_9873572_100] locationId[-281470681677823] [Team_GameServices][GIM][Matchmaking]
  joinPu:
    /^<(?<isoDate>[\d\-T:.Z]+)>.+<Join PU>.+shard\[(?<shard>[\d\w_]+)\].+$/gm,

  contestedZoneElevator:
    /^<(?<isoDate>[\d\-T:.Z]+)>.+TransitManager_(?<elevatorName>[a-zA-Z]*Dungeon[a-zA-Z]*).+$/gm,
};
