import Link from "next/link";

interface Props {
  searchParams: URLSearchParams;
}

const Filters = ({ searchParams }: Props) => {
  const unknownHandleSearchParams = new URLSearchParams(searchParams);
  if (searchParams.get("filter") === "unknown-handle") {
    unknownHandleSearchParams.delete("filter");
  } else {
    unknownHandleSearchParams.set("filter", "unknown-handle");
  }

  const unknownDiscordIdSearchParams = new URLSearchParams(searchParams);
  if (searchParams.get("filter") === "unknown-discord-id") {
    unknownDiscordIdSearchParams.delete("filter");
  } else {
    unknownDiscordIdSearchParams.set("filter", "unknown-discord-id");
  }

  const unknownTeamspeakIdSearchParams = new URLSearchParams(searchParams);
  if (searchParams.get("filter") === "unknown-teamspeak-id") {
    unknownTeamspeakIdSearchParams.delete("filter");
  } else {
    unknownTeamspeakIdSearchParams.set("filter", "unknown-teamspeak-id");
  }

  return (
    <>
      <p className="w-full">Filter unbekannte ...</p>

      <div className="flex gap-2 mt-2">
        <Link
          href={`/spynet/citizen?${unknownHandleSearchParams.toString()}`}
          className="border border-sinister-red-500 hover:border-sinister-red-300 h-11 px-6 text-sinister-red-500 hover:text-sinister-red-300 rounded flex items-center justify-center"
        >
          Handles
        </Link>

        <Link
          href={`/spynet/citizen?${unknownDiscordIdSearchParams.toString()}`}
          className="border border-sinister-red-500 hover:border-sinister-red-300 h-11 px-6 text-sinister-red-500 hover:text-sinister-red-300 rounded flex items-center justify-center"
        >
          Discord IDs
        </Link>

        <Link
          href={`/spynet/citizen?${unknownTeamspeakIdSearchParams.toString()}`}
          className="border border-sinister-red-500 hover:border-sinister-red-300 h-11 px-6 text-sinister-red-500 hover:text-sinister-red-300 rounded flex items-center justify-center"
        >
          TeamSpeak IDs
        </Link>
      </div>
    </>
  );
};

export default Filters;
