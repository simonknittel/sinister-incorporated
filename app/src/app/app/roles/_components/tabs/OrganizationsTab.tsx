"use client";

import TabPanel from "../../../../_components/tabs/TabPanel";
import { OrganizationMembershipSection } from "./components/OrganizationMembershipSection";
import { OrganizationSection } from "./components/OrganizationSection";

export const OrganizationsTab = () => {
  return (
    <TabPanel id="organizations">
      <OrganizationSection />

      <OrganizationMembershipSection className="mt-4" />
    </TabPanel>
  );
};
