import "server-only";

import { getApplicationContext } from "@/modules/application";
import { probeUploadImageDimensions as probeUploadImageDimensionsUseCase } from "@sam-monorepo/application";
import { after } from "next/server";

/**
 * Probes the dimensions of an image upload after the response (see
 * `probeUploadImageDimensions()` of the application package)
 */
export const probeUploadImageDimensions = (uploadId: string) => {
  after(() =>
    probeUploadImageDimensionsUseCase(getApplicationContext(), { uploadId }),
  );
};
