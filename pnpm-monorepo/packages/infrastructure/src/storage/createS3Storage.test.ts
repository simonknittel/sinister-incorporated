import type { CopyObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { describe, expect, test, vi } from "vitest";
import { createS3Storage, type S3StorageOptions } from "./createS3Storage.js";

const BUCKET_NAME = "uploads";

type Body = {
  readonly transformToByteArray: () => Promise<Uint8Array>;
};

const createBody = (bytes: Uint8Array): Body => ({
  transformToByteArray: vi.fn(async () => bytes),
});

/** A client that answers each command with the given output */
const createStorage = (
  output: { Body?: Body; ContentLength?: number } = {},
) => {
  const send = vi.fn(
    async (
      command: GetObjectCommand | CopyObjectCommand,
      options: { readonly abortSignal: AbortSignal },
    ) => {
      void command;
      void options;
      return output;
    },
  );
  const storage = createS3Storage({
    client: { send } as unknown as S3StorageOptions["client"],
    bucketName: BUCKET_NAME,
  });

  return { storage, send };
};

describe("readObject", () => {
  test("gives the bytes of the object", async () => {
    const { storage, send } = createStorage({
      Body: createBody(new Uint8Array([1, 2, 3])),
      ContentLength: 3,
    });

    const bytes = await storage.readObject("upload-1", { maximumBytes: 10 });

    expect(bytes).toEqual(new Uint8Array([1, 2, 3]));
    const [command, options] = send.mock.calls[0] ?? [];
    expect((command as GetObjectCommand).input).toEqual({
      Bucket: BUCKET_NAME,
      Key: "upload-1",
    });
    expect(options).toHaveProperty("abortSignal");
  });

  test("gives null for an object that the declared length shows as too large, without a read", async () => {
    const body = createBody(new Uint8Array([1, 2, 3]));
    const { storage } = createStorage({ Body: body, ContentLength: 11 });

    const bytes = await storage.readObject("upload-1", { maximumBytes: 10 });

    expect(bytes).toBeNull();
    expect(body.transformToByteArray).not.toHaveBeenCalled();
  });

  test("gives null for an object that is larger than its declared length", async () => {
    const { storage } = createStorage({
      Body: createBody(new Uint8Array(11)),
    });

    const bytes = await storage.readObject("upload-1", { maximumBytes: 10 });

    expect(bytes).toBeNull();
  });

  test("gives null for an empty object", async () => {
    const { storage } = createStorage({
      Body: createBody(new Uint8Array()),
      ContentLength: 0,
    });

    const bytes = await storage.readObject("upload-1", { maximumBytes: 10 });

    expect(bytes).toBeNull();
  });
});

describe("copyObject", () => {
  test("copies the object within the bucket and replaces its metadata", async () => {
    const { storage, send } = createStorage();

    await storage.copyObject({
      sourceKey: "upload-1",
      targetKey: "upload-2",
      contentType: "image/png",
    });

    const [command] = send.mock.calls[0] ?? [];
    expect((command as CopyObjectCommand).input).toEqual({
      Bucket: BUCKET_NAME,
      CopySource: "uploads/upload-1",
      Key: "upload-2",
      ContentType: "image/png",
      MetadataDirective: "REPLACE",
    });
  });
});
