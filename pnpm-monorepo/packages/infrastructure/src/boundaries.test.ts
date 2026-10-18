import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { expect, test } from "vitest";

/**
 * The hosts compose the implementations of this package. Thus the package
 * must not import a host (`apps/…`, `@/…`), Next.js, React or `server-only`
 * (a marker of Next.js).
 */
const FORBIDDEN_IMPORT =
  /^(?:next|next\/.*|react|react\/.*|react-dom|react-dom\/.*|server-only|@\/.*|apps\/.*)$/;

/** The directory of the hosts (`pnpm-monorepo/apps`) */
const APPS_DIRECTORY = resolve(import.meta.dirname, "../../../apps");

/** Static imports, re-exports, side-effect imports and dynamic imports */
const IMPORT_SPECIFIER =
  /(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)["']([^"']+)["']/g;

const resolvesIntoApps = (fileName: string, specifier: string) =>
  specifier.startsWith(".") &&
  !relative(
    APPS_DIRECTORY,
    resolve(import.meta.dirname, dirname(fileName), specifier),
  ).startsWith("..");

test("the package does not import a host, Next.js or React", async () => {
  const fileNames = (await readdir(import.meta.dirname, { recursive: true }))
    .filter((fileName) => fileName.endsWith(".ts"))
    .sort();

  const imports = await Promise.all(
    fileNames.map(async (fileName) => {
      const source = await readFile(join(import.meta.dirname, fileName), {
        encoding: "utf8",
      });

      return Array.from(source.matchAll(IMPORT_SPECIFIER), (match) => ({
        fileName,
        specifier: match[1] ?? "",
      }));
    }),
  ).then((importsPerFile) => importsPerFile.flat());

  // Makes sure that the pattern still finds the imports of the package
  expect(imports.length).toBeGreaterThan(0);

  expect(
    imports.filter(
      ({ fileName, specifier }) =>
        FORBIDDEN_IMPORT.test(specifier) ||
        resolvesIntoApps(fileName, specifier),
    ),
  ).toEqual([]);
});
