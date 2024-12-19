import { authenticateApi } from "@/auth/server";
import { prisma } from "@/db";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "../../../env.mjs";
import apiErrorHandler from "../../../lib/apiErrorHandler";

const postBodySchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().startsWith("image/"),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi("/api/upload", "POST");
    authentication.authorizeApi("role", "manage");

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = postBodySchema.parse(body);

    /**
     * Do the thing
     */
    const item = await prisma.upload.create({
      data: {
        fileName: data.fileName,
        mimeType: data.mimeType,
        createdBy: {
          connect: {
            id: authentication.session.user.id,
          },
        },
      },
    });

    const presignedUploadUrl = await getPresignedUploadUrl(item.id);

    /**
     * Respond with the result
     */
    return NextResponse.json({ item, presignedUploadUrl });
  } catch (error) {
    /**
     * Respond with an error
     */
    return apiErrorHandler(error);
  }
}

async function getPresignedUploadUrl(key: string) {
  const S3 = new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });

  return await getSignedUrl(
    S3,
    new PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }),
    {
      expiresIn: 60 * 60, // 1 hour
    },
  );
}
