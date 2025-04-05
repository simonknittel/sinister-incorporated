import { SubNavigation } from "@/common/components/SubNavigation";
import clsx from "clsx";

type Props = Readonly<{
  className?: string;
}>;

export const Navigation = ({ className }: Props) => {
  const pages = [
    {
      name: "Offene Tasks",
      path: "/app/tasks",
    },
    {
      name: "Geschlossene Tasks",
      path: "/app/tasks/history",
    },
  ];

  return (
    <SubNavigation
      pages={pages}
      className={clsx("flex flex-wrap justify-center", className)}
    />
  );
};
