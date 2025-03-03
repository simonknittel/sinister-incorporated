import { requireAuthentication } from "@/auth/server";
import { Link } from "@/common/components/Link";
import clsx from "clsx";

type Props = Readonly<{
  className?: string;
  active: string;
}>;

export const Navigation = async ({ className, active }: Props) => {
  const authentication = await requireAuthentication();
  const [showOverview, showTransactions, showSettings] = await Promise.all([
    authentication.authorize("silcBalanceOfOtherCitizen", "read"),
    authentication.authorize("silcTransactionOfOtherCitizen", "read"),
    authentication.authorize("silcSetting", "manage"),
  ]);

  if (!showOverview && !showTransactions) return null;

  const pages = [
    ...(showOverview
      ? [
          {
            name: "Übersicht",
            path: `/app/silc`,
          },
        ]
      : []),
    ...(showTransactions
      ? [
          {
            name: "Transaktionen",
            path: `/app/silc/transactions`,
          },
        ]
      : []),
    ...(showSettings
      ? [
          {
            name: "Einstellungen",
            path: `/app/silc/settings`,
          },
        ]
      : []),
  ];

  return (
    <div className={clsx("flex flex-wrap", className)}>
      {pages.map((page) => (
        <Link
          key={page.path}
          href={page.path}
          className={clsx(
            "first:rounded-l border-[1px] border-sinister-red-700 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase",
            {
              "bg-sinister-red-500 text-white": active === page.path,
              "text-sinister-red-500 hover:text-sinister-red-300 hover:border-sinister-red-300":
                active !== page.path,
            },
          )}
        >
          {page.name}
        </Link>
      ))}
    </div>
  );
};
