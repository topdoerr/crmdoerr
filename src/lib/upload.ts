import fs from "fs/promises";
import path from "path";

/**
 * Saves an uploaded File to /public/uploads/{relType}/{relId}/{timestamp}-{filename}.
 * Returns the path relative to /public (so it can be served directly by Next.js).
 */
export async function saveUploadedFile(
  file: File,
  relType: string,
  relId: number
): Promise<string> {
  const safeRelType = relType.replace(/[^a-zA-Z0-9_-]/g, "_");
  const relDir = path.join("uploads", safeRelType, String(relId));
  const absDir = path.join(process.cwd(), "public", relDir);

  await fs.mkdir(absDir, { recursive: true });

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${timestamp}-${safeName}`;
  const absPath = path.join(absDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(absPath, buffer);

  // Return path relative to /public (served at /uploads/...)
  return `/${path.posix.join("uploads", safeRelType, String(relId), fileName)}`;
}

export async function deleteUploadedFile(relativePath: string): Promise<void> {
  try {
    const clean = relativePath.startsWith("/")
      ? relativePath.slice(1)
      : relativePath;
    const absPath = path.join(process.cwd(), "public", clean);
    await fs.unlink(absPath);
  } catch {
    // File may already be missing; ignore.
  }
}
