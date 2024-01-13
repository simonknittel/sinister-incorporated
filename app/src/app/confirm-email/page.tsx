import { redirect } from "next/navigation";
import { prisma } from "scripts/prisma";
import { authenticatePage } from "~/_lib/auth/authenticateAndAuthorize";

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Page({ searchParams }: Readonly<Props>) {
  const authentication = await authenticatePage();

  if (
    !searchParams.token ||
    (Array.isArray(searchParams.token) && searchParams.token.length === 0)
  )
    redirect("/email-confirmation");

  const token = Array.isArray(searchParams.token)
    ? searchParams.token[0]
    : searchParams.token;

  const result = await prisma.emailConfirmationToken.findUnique({
    where: {
      userId: authentication.session.user.id,
      email: authentication.session.user.email!,
      token,
      expires: {
        gt: new Date(),
      },
    },
  });

  if (!result) redirect("/email-confirmation");

  await prisma.$transaction([
    prisma.emailConfirmationToken.deleteMany({
      where: {
        userId: authentication.session.user.id,
      },
    }),
    prisma.user.update({
      where: {
        id: authentication.session.user.id,
      },
      data: {
        emailVerified: new Date(),
      },
    }),
  ]);

  redirect("/clearance");
}
