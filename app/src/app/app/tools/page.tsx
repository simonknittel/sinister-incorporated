import { authenticatePage } from "@/auth/server";
import { Hero } from "@/common/components/Hero";
import { Link } from "@/common/components/Link";
import { itemTypes } from "@/cornerstone-image-browser/utils/config";
import { type Metadata } from "next";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "Tools | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  await authenticatePage("/app/tools");

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Tools" withGlitch />
      </div>

      <div className="mt-4 lg:mt-8">
        <article className="background-secondary rounded-primary p-4 lg:p-8">
          <h2 className="font-bold text-xl">Cornerstone Image Browser</h2>

          <p className="mt-2">
            Stellt die Bilder von Cornerstone nebeneinander dar, um sie visuell
            einfach vergleichen zu können.
          </p>

          <div className="mt-2 flex flex-wrap gap-4">
            {itemTypes.map((item) => (
              <Link
                key={item.page}
                href={`/app/tools/cornerstone-image-browser/${item.page}`}
                className="text-sinister-red-500 hover:text-sinister-red-300 focus-visible:text-sinister-red-300"
                prefetch={false}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}
