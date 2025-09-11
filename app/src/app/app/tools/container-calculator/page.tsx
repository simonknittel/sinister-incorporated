import { ContainerCalculator } from "@/modules/container-calculator/components/ContainerCalculator";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Container Calculator | S.A.M. - Sinister Incorporated",
};

export default function Page() {
  return <ContainerCalculator />;
}
