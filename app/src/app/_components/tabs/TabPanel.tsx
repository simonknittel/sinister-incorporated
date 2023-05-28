"use client";

import { type ReactNode } from "react";
import { useTabsContext } from "./TabsContext";

interface Props {
  children?: ReactNode;
  id: string;
}

const TabPanel = ({ children, id }: Props) => {
  const { activeTab } = useTabsContext();

  if (activeTab !== id) return null;

  return children;
};

export default TabPanel;
