import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const region = "auto"; // Tigris uses 'auto' region
const endpoint = process.env.TIGRIS_STORAGE_ENDPOINT;
const accessKeyId = process.env.TIGRIS_STORAGE_ACCESS_KEY_ID;
const secretAccessKey = process.env.TIGRIS_STORAGE_SECRET_ACCESS_KEY;
const bucketName = process.env.TIGRIS_STORAGE_BUCKET;

let s3Client: S3Client | null = null;

/**
 * Get S3 client singleton for Tigris Object Storage.
 * Gracefully handles missing credentials during build/local development.
 */
export function getS3Client() {
  if (s3Client) return s3Client;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    if (process.env.NODE_ENV === "production") {
      console.error("Missing Tigris Storage credentials in production!");
    }
    return null;
  }

  s3Client = new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true, // Required for Tigris
  });

  return s3Client;
}

/**
 * Upload an object to Tigris.
 */
export async function uploadToTigris(
  key: string,
  body: string | Buffer,
  contentType: string = "application/json",
) {
  const client = getS3Client();
  if (!client || !bucketName) return null;

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    return await client.send(command);
  } catch (error) {
    console.error("Error uploading to Tigris:", error);
    return null;
  }
}

/**
 * Download an object from Tigris as a string.
 */
export async function getFromTigris(key: string) {
  const client = getS3Client();
  if (!client || !bucketName) return null;

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    const response = await client.send(command);
    return await response.Body?.transformToString();
  } catch (error) {
    console.error("Error fetching from Tigris:", error);
    return null;
  }
}
