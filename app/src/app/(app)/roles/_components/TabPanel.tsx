"use client";

import clsx from "clsx";
import { type ReactNode } from "react";
import { useTabsContext } from "./TabsContext";

interface Props {
  children?: ReactNode;
  tab: string;
}

const TabPanel = ({ children, tab }: Props) => {
  const { activeTab } = useTabsContext();

  return <div className={clsx({ hidden: activeTab !== tab })}>{children}</div>;
};

export default TabPanel;
