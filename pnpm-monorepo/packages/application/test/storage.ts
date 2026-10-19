import {
  MAXIMUM_STORAGE_DELETE_KEYS,
  type FileStorage,
  type StorageDeleteFailure,
} from "../src/context.js";

interface TestStoredObject {
  readonly key: string;
  readonly lastModified: Date;
  /** The content. Without it, the object has no size and no content. */
  readonly bytes?: Uint8Array;
}

interface TestStorageOptions {
  /** The objects of the bucket */
  readonly objects?: readonly TestStoredObject[];
  /** The keys that each delete gives back as failures */
  readonly failingDeleteKeys?: readonly string[];
  /**
   * The delete requests from this index (zero-based) on reject, like a bucket
   * that stops to answer
   */
  readonly rejectsDeleteFromRequest?: number;
}

/** The base of the presigned URLs of the tests */
const TEST_STORAGE_URL = "https://storage.example.com/";

/**
 * The object storage of the tests. It records the keys of each delete
 * request (also of a rejected request) and the presigned URLs that it gives,
 * in the sequence of the calls. The objects do not change: a delete or a copy
 * does not remove or add an object.
 */
export const createTestStorage = ({
  objects = [],
  failingDeleteKeys = [],
  rejectsDeleteFromRequest,
}: TestStorageOptions = {}) => {
  const deleteRequests: string[][] = [];
  const uploadUrls: string[] = [];
  const downloadUrls: string[] = [];

  const findObject = (key: string) => {
    const object = objects.find((candidate) => candidate.key === key);
    if (!object) throw new Error(`The object ${key} does not exist`);

    return object;
  };

  const storage: FileStorage = {
    readObject: async (key, { maximumBytes, byteRange }) => {
      const { bytes } = findObject(key);
      if (!bytes || bytes.byteLength > maximumBytes) return null;

      const readBytes = byteRange
        ? bytes.slice(byteRange.first, byteRange.last + 1)
        : bytes.slice();

      return readBytes.byteLength === 0 ? null : readBytes;
    },
    copyObject: async () => undefined,
    getObjectSize: async (key) => findObject(key).bytes?.byteLength ?? null,
    listObjects: async () =>
      objects.map(({ key, lastModified }) => ({ key, lastModified })),
    deleteObjects: async (keys) => {
      if (keys.length > MAXIMUM_STORAGE_DELETE_KEYS)
        throw new RangeError(
          `A delete takes at most ${MAXIMUM_STORAGE_DELETE_KEYS} keys`,
        );

      const requestIndex = deleteRequests.push([...keys]) - 1;
      if (
        rejectsDeleteFromRequest !== undefined &&
        requestIndex >= rejectsDeleteFromRequest
      )
        throw new Error("The bucket is not available");

      return {
        failures: keys
          .filter((key) => failingDeleteKeys.includes(key))
          .map((key): StorageDeleteFailure => ({ key, code: "InternalError" })),
      };
    },
    createUploadUrl: async ({ key }) => {
      const url = new URL(
        `upload/${encodeURIComponent(key)}`,
        TEST_STORAGE_URL,
      ).toString();
      uploadUrls.push(url);
      return url;
    },
    createDownloadUrl: async ({ key }) => {
      const url = new URL(
        `download/${encodeURIComponent(key)}`,
        TEST_STORAGE_URL,
      ).toString();
      downloadUrls.push(url);
      return url;
    },
  };

  return { storage, deleteRequests, uploadUrls, downloadUrls };
};
