import { supabase } from '@/lib/supabase';

// Bucket name/folder for volunteer files
const BUCKET_NAME = 'volunteer-files';

/**
 * Upload a file to Supabase Storage
 */
export const uploadFile = async (
  file: File | Blob,
  path: string,
  fileMimeType?: string
): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        contentType: fileMimeType || 'application/octet-stream',
        upsert: true
      });

    if (error) {
      console.error("Error uploading file to Supabase:", error);
      throw error;
    }

    // Return the URL for the uploaded file
    const { data: publicUrl } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error("Error uploading file to Supabase:", error);
    throw error;
  }
};

/**
 * Generate a signed URL for private file access
 */
export const getSignedUrl = async (path: string, expiresIn = 3600): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error("Error generating signed URL:", error);
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
};

/**
 * Delete a file from Supabase Storage
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error("Error deleting file from Supabase:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error deleting file from Supabase:", error);
    throw error;
  }
};

/**
 * List files in a directory
 */
export const listFiles = async (prefix: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(prefix);

    if (error) {
      console.error("Error listing files in Supabase:", error);
      throw error;
    }

    return data.map(item => item.name);
  } catch (error) {
    console.error("Error listing files in Supabase:", error);
    throw error;
  }
};

/**
 * Generate a path for a new file using user ID and filename
 */
export const generatePath = (userId: string, fileName: string): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.]/g, "_");
  return `volunteers/${userId}/${timestamp}-${sanitizedFileName}`;
}; 