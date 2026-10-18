import { requireAuthenticationPage } from "@/modules/auth/server";
import { ProfileForm } from "@/modules/citizen/components/ProfileForm";
import { getOwnProfileSettings } from "@/modules/citizen/queries/getOwnProfileSettings";
import { SUPPORTED_TIMEZONES } from "@sam-monorepo/domain";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Profil",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage(
    "/app/account/profile",
  );
  if (!authentication.session.entity) notFound();

  const citizen = await getOwnProfileSettings();

  return (
    <ProfileForm
      timezones={SUPPORTED_TIMEZONES}
      timezone={citizen.timezone}
      birthdayDay={citizen.birthdayDay}
      birthdayMonth={citizen.birthdayMonth}
    />
  );
}
