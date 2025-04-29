import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { withTrace } from "@/tracing/utils/withTrace";
import type { Event } from "@prisma/client";
import { cache } from "react";

export const getEventById = cache(
  withTrace("getEventById", async (id: Event["id"]) => {
    const authentication = await requireAuthentication();
    if (!(await authentication.authorize("event", "read")))
      throw new Error("Forbidden");

    return prisma.event.findUnique({
      where: {
        id,
      },
      include: {
        discordParticipants: true,
        positions: {
          where: {
            parentPositionId: null,
          },
          orderBy: {
            order: "asc",
          },
          include: {
            applications: {
              include: {
                citizen: true,
              },
            },
            citizen: true,
            requiredVariants: {
              orderBy: {
                order: "asc",
              },
              include: {
                variant: {
                  include: {
                    series: {
                      include: {
                        manufacturer: {
                          include: {
                            image: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            childPositions: {
              orderBy: {
                order: "asc",
              },
              include: {
                applications: {
                  include: {
                    citizen: true,
                  },
                },
                citizen: true,
                requiredVariants: {
                  orderBy: {
                    order: "asc",
                  },
                  include: {
                    variant: {
                      include: {
                        series: {
                          include: {
                            manufacturer: {
                              include: {
                                image: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                childPositions: {
                  orderBy: {
                    order: "asc",
                  },
                  include: {
                    applications: {
                      include: {
                        citizen: true,
                      },
                    },
                    citizen: true,
                    requiredVariants: {
                      orderBy: {
                        order: "asc",
                      },
                      include: {
                        variant: {
                          include: {
                            series: {
                              include: {
                                manufacturer: {
                                  include: {
                                    image: true,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    childPositions: {
                      orderBy: {
                        order: "asc",
                      },
                      include: {
                        applications: {
                          include: {
                            citizen: true,
                          },
                        },
                        citizen: true,
                        requiredVariants: {
                          orderBy: {
                            order: "asc",
                          },
                          include: {
                            variant: {
                              include: {
                                series: {
                                  include: {
                                    manufacturer: {
                                      include: {
                                        image: true,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        managers: true,
      },
    });
  }),
);

export const getFutureEvents = cache(
  withTrace("getFutureEvents", async () => {
    const authentication = await requireAuthentication();
    if (!(await authentication.authorize("event", "read")))
      throw new Error("Forbidden");

    const now = new Date();

    return prisma.event.findMany({
      where: {
        OR: [
          {
            startTime: {
              gte: now,
            },
          },
          {
            endTime: {
              gte: now,
            },
          },
        ],
      },
      include: {
        discordParticipants: true,
        managers: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });
  }),
);

export const getPastEvents = cache(
  withTrace("getPastEvents", async () => {
    const authentication = await requireAuthentication();
    if (!(await authentication.authorize("event", "read")))
      throw new Error("Forbidden");

    const now = new Date();

    return prisma.event.findMany({
      where: {
        startTime: {
          lt: now,
        },
      },
      include: {
        discordParticipants: true,
        managers: true,
      },
      orderBy: {
        startTime: "desc",
      },
    });
  }),
);
