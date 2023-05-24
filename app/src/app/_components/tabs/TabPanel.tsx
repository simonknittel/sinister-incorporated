"use client";

import clsx from "clsx";
import { type ReactNode } from "react";
import { useTabsContext } from "./TabsContext";

interface Props {
  children?: ReactNode;
  id: string;
}

const TabPanel = ({ children, id }: Props) => {
  const { activeTab } = useTabsContext();

  return <div className={clsx({ hidden: activeTab !== id })}>{children}</div>;
};

export default TabPanel;
