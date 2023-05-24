import { type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const TabList = ({ children }: Props) => {
  return <div className="flex mb-4 flex-wrap">{children}</div>;
};

export default TabList;
