import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import type { Event } from "@prisma/client";
import { cache } from "react";

export const getEventById = cache(async (id: Event["id"]) => {
  return getTracer().startActiveSpan("getEventById", async (span) => {
    try {
      return await prisma.event.findUnique({
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
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
});

export const getFutureEvents = cache(async () => {
  return getTracer().startActiveSpan("getFutureEvents", async (span) => {
    try {
      const now = new Date();

      return await prisma.event.findMany({
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
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
});

export const getPastEvents = cache(async () => {
  return getTracer().startActiveSpan("getPastEvents", async (span) => {
    try {
      const now = new Date();

      return await prisma.event.findMany({
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
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
});
