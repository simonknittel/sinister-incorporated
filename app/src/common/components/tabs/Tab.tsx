"use client";

import clsx from "clsx";
import { type ReactNode } from "react";
import { useTabsContext } from "./TabsContext";

interface Props {
  children?: ReactNode;
  id: string;
}

const Tab = ({ children, id }: Readonly<Props>) => {
  const { activeTab, setActiveTab } = useTabsContext();

  return (
    <button
      onClick={() => setActiveTab(id)}
      type="button"
      className={clsx(
        "first:rounded-l border-[1px] border-sinister-red-500 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase",
        {
          "bg-sinister-red-500 text-white": activeTab === id,
          "text-sinister-red-500": activeTab !== id,
          "hover:text-sinister-red-300 hover:border-sinister-red-300":
            activeTab !== id,
        },
      )}
    >
      {children}
    </button>
  );
};

export default Tab;
