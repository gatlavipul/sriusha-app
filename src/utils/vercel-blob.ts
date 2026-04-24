import { put, del, list } from '@vercel/blob';

/**
 * Upload a file to Vercel Blob storage.
 * Returns the public URL of the uploaded blob.
 */
export async function uploadToBlob(
  file: File | Buffer,
  filename: string,
  options?: { folder?: string }
): Promise<string> {
  const pathname = options?.folder
    ? `${options.folder}/${filename}`
    : filename;

  const blob = await put(pathname, file, {
    access: 'public',
  });

  return blob.url;
}

/**
 * Delete a blob by its URL.
 */
export async function deleteBlob(url: string): Promise<void> {
  await del(url);
}

/**
 * List all blobs, optionally filtered by prefix/folder.
 */
export async function listBlobs(prefix?: string) {
  const result = await list({ prefix });
  return result.blobs;
}
