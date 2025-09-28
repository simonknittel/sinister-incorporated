import type { ComponentProps } from "react";
import { EntryFilterContextProvider } from "./EntryFilterContext";
import { LogAnalyzer } from "./LogAnalyzer";

type Props = ComponentProps<typeof LogAnalyzer>;

export const Bundle = (props: Props) => {
  return (
    <EntryFilterContextProvider>
      <LogAnalyzer {...props} />
    </EntryFilterContextProvider>
  );
};
