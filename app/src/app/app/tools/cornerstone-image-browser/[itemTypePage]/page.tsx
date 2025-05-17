import { authenticatePage } from "@/auth/server";
import { Link } from "@/common/components/Link";
import Note from "@/common/components/Note";
import { itemTypes } from "@/cornerstone-image-browser/utils/config";
import { log } from "@/logging";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.array(
  z.object({
    ItemId: z.string(),
    Name: z.string(),
    Manu: z.string(),
  }),
);

export const revalidate = 86400; // 24 hours

type Params = Promise<{
  itemTypePage: string;
}>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  const { itemTypePage } = await props.params;
  const itemTypeConfig = itemTypes.find(
    (itemType) => itemType.page === itemTypePage,
  );
  if (!itemTypeConfig) notFound();

  return {
    title: `${itemTypeConfig.title} - Cornerstone Image Browser | S.A.M. - Sinister Incorporated`,
  };
}

interface Props {
  readonly params: Params;
}

export default async function Page({ params }: Props) {
  await authenticatePage("/app/tools/cornerstone-image-browser/[itemType]");

  const { itemTypePage } = await params;
  const itemTypeConfig = itemTypes.find(
    (itemType) => itemType.page === itemTypePage,
  );
  if (!itemTypeConfig) notFound();

  const t = await getTranslations();

  const response = await fetch(itemTypeConfig.dataUrl, {
    next: {
      revalidate: 86400, // 24 hours
    },
  });
  if (!response.ok) {
    await log.error("Failed to load data from Cornerstone", {
      status: response.status,
      responseBody: await response.text(),
    });
    return (
      <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
        <Link
          href="/app/tools"
          className="text-sinister-red-500 hover:text-sinister-red-300 focus-visible:text-sinister-red-300 inline-flex items-center gap-2"
        >
          <FaChevronLeft />
          Alle Tools
        </Link>

        <h1 className="text-xl font-bold mt-2 leading-tight">
          {itemTypeConfig.title} - Cornerstone Image Browser
        </h1>

        <Note
          type="error"
          className="mt-4"
          message={t("Common.internalServerError")}
        />
      </main>
    );
  }
  const data = (await response.json()) as unknown;
  const parsedData = schema.safeParse(data);
  if (!parsedData.success) {
    await log.error("Failed to parse data from Cornerstone", {
      error: serializeError(parsedData.error),
    });
    return (
      <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
        <Link
          href="/app/tools"
          className="text-sinister-red-500 hover:text-sinister-red-300 focus-visible:text-sinister-red-300 inline-flex items-center gap-2"
        >
          <FaChevronLeft />
          Alle Tools
        </Link>

        <h1 className="text-xl font-bold mt-2 leading-tight">
          {itemTypeConfig.title} - Cornerstone Image Browser
        </h1>

        <Note
          type="error"
          className="mt-4"
          message={t("Common.internalServerError")}
        />
      </main>
    );
  }

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <Link
        href="/app/tools"
        className="text-sinister-red-500 hover:text-sinister-red-300 focus-visible:text-sinister-red-300 inline-flex items-center gap-2"
      >
        <FaChevronLeft />
        Alle Tools
      </Link>

      <h1 className="text-xl font-bold mt-2 leading-tight">
        {itemTypeConfig.title} - Cornerstone Image Browser
      </h1>

      {!parsedData.success ? (
        <Note
          type="error"
          className="mt-4"
          message={t("Common.internalServerError")}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 mt-4">
          {parsedData.data.map((item) => (
            <Link
              key={item.ItemId}
              href={`${itemTypeConfig.linkBase}/${item.ItemId}`}
              className="h-full group rounded-secondary overflow-hidden flex flex-col"
              target="_blank"
              rel="noreferrer"
            >
              <div className="flex-1 background-secondary group-hover:background-tertiary relative flex flex-col justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://cstone.space/uifimages/${item.ItemId}.png`}
                  alt=""
                  className="w-full h-auto object-contain relative z-10 aspect-square"
                  loading="lazy"
                />
                <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-500 text-sm text-center">
                  Bild nicht
                  <br />
                  verfügbar
                </p>
              </div>

              <div className="p-2 group-hover:background-tertiary flex-1 flex flex-col gap-1 justify-end leading-tight">
                {item.Manu && (
                  <p className="text-xs text-gray-500">{item.Manu}</p>
                )}

                <h3 className="text-sm font-bold">{item.Name}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
