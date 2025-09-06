import { requireAuthenticationPage } from "@/auth/server";
import { Link } from "@/common/components/Link";
import { Tile } from "@/common/components/Tile";
import { cornerstoneImageBrowserItemTypes } from "@/cornerstone-image-browser/utils/config";
import { type Metadata } from "next";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "Cornerstone Image Browser | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  await requireAuthenticationPage("/app/tools/cornerstone-image-browser");

  return (
    <div className="max-w-[1920px] mx-auto">
      <Tile
        heading="Ausrüstungstypen"
        childrenClassName="flex flex-wrap gap-x-4"
      >
        {cornerstoneImageBrowserItemTypes.map((item) => (
          <Link
            key={item.page}
            href={`/app/tools/cornerstone-image-browser/${item.page}`}
            className="text-sinister-red-500 hover:text-sinister-red-300 focus-visible:text-sinister-red-300 hover:underline focus-visible:underline"
            prefetch={false}
          >
            {item.title}
          </Link>
        ))}
      </Tile>
    </div>
  );
}
