import { type ScheduledHandler } from "aws-lambda";
import { shuffle } from "lodash";
import type { z } from "zod";
import { prisma } from "./db";
import { getEventUsers } from "./discord/utils/getEventUsers";
import { getEvents } from "./discord/utils/getEvents";
import type { eventSchema } from "./discord/utils/schemas";
import { log } from "./logging";
import { publishNotification } from "./pusher/utils/publishNotification";

export const handler: ScheduledHandler = async () => {
	try {
		const { data: _futureEventsFromDiscord } = await getEvents();

		// Shuffle array so rate limits not always hitting the same events
		const futureEventsFromDiscord = shuffle(_futureEventsFromDiscord);
		// // Limit to 5 events to avoid rate limits
		// futureEventsFromDiscord = futureEventsFromDiscord.slice(0, 5);

		await deleteCancelledEvents(futureEventsFromDiscord);

		for (const futureEventFromDiscord of futureEventsFromDiscord) {
			const existingEventFromDatabase = await prisma.event.findUnique({
				where: {
					discordId: futureEventFromDiscord.id,
				},
			});

			if (existingEventFromDatabase) {
				const hasAnyChanges =
					existingEventFromDatabase.name !== futureEventFromDiscord.name ||
					existingEventFromDatabase.startTime.getTime() !==
						futureEventFromDiscord.scheduled_start_time.getTime() ||
					// biome-ignore lint/suspicious/noDoubleEquals: <explanation>
					existingEventFromDatabase.endTime?.getTime() !=
						futureEventFromDiscord.scheduled_end_time?.getTime() ||
					// biome-ignore lint/suspicious/noDoubleEquals: <explanation>
					existingEventFromDatabase.description !=
						futureEventFromDiscord.description ||
					// biome-ignore lint/suspicious/noDoubleEquals: <explanation>
					existingEventFromDatabase.location !=
						futureEventFromDiscord.entity_metadata.location ||
					// biome-ignore lint/suspicious/noDoubleEquals: <explanation>
					existingEventFromDatabase.discordImage !=
						futureEventFromDiscord.image;

				if (hasAnyChanges) {
					await prisma.event.update({
						where: {
							id: existingEventFromDatabase.id,
						},
						data: {
							name: futureEventFromDiscord.name,
							startTime: futureEventFromDiscord.scheduled_start_time,
							endTime: futureEventFromDiscord.scheduled_end_time,
							description: futureEventFromDiscord.description,
							location: futureEventFromDiscord.entity_metadata.location,
							discordImage: futureEventFromDiscord.image,
						},
					});
				}

				const hasChangesForNotification =
					existingEventFromDatabase.name !== futureEventFromDiscord.name ||
					existingEventFromDatabase.startTime.getTime() !==
						futureEventFromDiscord.scheduled_start_time.getTime() ||
					// biome-ignore lint/suspicious/noDoubleEquals: <explanation>
					existingEventFromDatabase.endTime?.getTime() !=
						futureEventFromDiscord.scheduled_end_time?.getTime() ||
					// biome-ignore lint/suspicious/noDoubleEquals: <explanation>
					existingEventFromDatabase.description !=
						futureEventFromDiscord.description ||
					// biome-ignore lint/suspicious/noDoubleEquals: <explanation>
					existingEventFromDatabase.location !=
						futureEventFromDiscord.entity_metadata.location;

				/*if (hasChangesForNotification) {
					await publishNotification(
						["updatedDiscordEvent"],
						"Event aktualisiert",
						futureEventFromDiscord.name,
						`/app/events/${existingEventFromDatabase.id}`,
					);
				}*/
			} else {
				const newEvent = await prisma.event.create({
					data: {
						discordId: futureEventFromDiscord.id,
						discordCreatorId: futureEventFromDiscord.creator_id,
						name: futureEventFromDiscord.name,
						startTime: futureEventFromDiscord.scheduled_start_time,
						endTime: futureEventFromDiscord.scheduled_end_time,
						description: futureEventFromDiscord.description,
						location: futureEventFromDiscord.entity_metadata.location,
						discordImage: futureEventFromDiscord.image,
						discordGuildId: futureEventFromDiscord.guild_id,
					},
				});

				await publishNotification(
					["newDiscordEvent"],
					"Neues Event",
					newEvent.name,
					`/app/events/${newEvent.id}`,
				);
			}

			await updateParticipants(futureEventFromDiscord);
		}
	} catch (error) {
		log.error("Failed to scrape Discord events", error);
		throw error;
	}
};

const deleteCancelledEvents = async (
	futureEventsFromDiscord: Awaited<ReturnType<typeof getEvents>>["data"],
) => {
	const futureEventsFromDatabase = await prisma.event.findMany({
		where: {
			startTime: {
				gte: new Date(),
			},
		},
	});

	const cancelledEvents = futureEventsFromDatabase.filter(
		(event) =>
			!futureEventsFromDiscord.some(
				(discordEvent) => discordEvent.id === event.discordId,
			),
	);

	if (cancelledEvents.length > 0) {
		await prisma.event.deleteMany({
			where: {
				id: {
					in: cancelledEvents.map((event) => event.id),
				},
			},
		});
	}

	for (const cancelledEvent of cancelledEvents) {
		await publishNotification(
			["deletedDiscordEvent"],
			"Event abgesagt",
			cancelledEvent.name,
		);
	}
};

const updateParticipants = async (
	discordEvent: z.infer<typeof eventSchema>,
) => {
	const databaseEvent = await prisma.event.findUnique({
		where: {
			discordId: discordEvent.id,
		},
	});
	if (!databaseEvent) return;

	const participants: { create: string[]; delete: string[] } = {
		create: [],
		delete: [],
	};
	const discordEventUserIds = (await getEventUsers(discordEvent.id)).map(
		(user) => user.user_id,
	);
	const existingDatabaseParticipantIds = (
		await prisma.eventDiscordParticipant.findMany({
			where: {
				event: {
					discordId: discordEvent.id,
				},
			},
		})
	).map((participant) => participant.discordUserId);

	// Collect new participants
	for (const userId of discordEventUserIds) {
		if (existingDatabaseParticipantIds.includes(userId)) continue;
		participants.create.push(userId);
	}

	// Collect removed participants
	for (const userId of existingDatabaseParticipantIds) {
		if (discordEventUserIds.includes(userId)) continue;
		participants.delete.push(userId);
	}

	// Save to database
	if (participants.delete.length > 0) {
		await prisma.$transaction([
			prisma.eventDiscordParticipant.deleteMany({
				where: {
					eventId: databaseEvent.id,
					discordUserId: {
						in: participants.delete,
					},
				},
			}),

			prisma.eventPositionApplication.deleteMany({
				where: {
					position: {
						eventId: databaseEvent.id,
					},
					citizen: {
						discordId: {
							in: participants.delete,
						},
					},
				},
			}),

			prisma.eventPosition.updateMany({
				where: {
					eventId: databaseEvent.id,
					citizen: {
						discordId: {
							in: participants.delete,
						},
					},
				},
				data: {
					citizenId: null,
				},
			}),
		]);
	}
	if (participants.create.length > 0) {
		await prisma.eventDiscordParticipant.createMany({
			data: participants.create.map((participantId) => ({
				eventId: databaseEvent.id,
				discordUserId: participantId,
			})),
		});
	}
};
