"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const Client = dynamic(() => import("./Client").then((mod) => mod.Client), {
  ssr: false,
});

type Props = ComponentProps<typeof Client>;

export const ClientLoader = (props: Props) => {
  return <Client {...props} />;
};
