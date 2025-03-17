import { requireAuthentication } from "@/auth/server";
import { SubNavigation } from "@/common/components/SubNavigation";
import clsx from "clsx";

type Props = Readonly<{
  className?: string;
}>;

export const Navigation = async ({ className }: Props) => {
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
    <SubNavigation
      pages={pages}
      className={clsx("flex flex-wrap", className)}
    />
  );
};
