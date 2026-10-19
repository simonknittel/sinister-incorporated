/**
 * Reads the fields that `DiscordPublishTargetFields` submits into the keys of
 * `discordPublishFieldsShape` of the application package. Every action that
 * reads them (publishing an event, creating one, editing a template) uses
 * this, so the names of the component and of the schema cannot drift apart —
 * they already did once, which made every publish from the settings card
 * fail validation.
 */
export const parseDiscordPublishFields = (formData: FormData) => ({
  discord_publish_target: formData.get("discordPublishTarget") || undefined,
  discord_publish_channel_id:
    formData.get("discordPublishChannelId") || undefined,
  discord_publish_location: formData.get("discordPublishLocation") || undefined,
});
