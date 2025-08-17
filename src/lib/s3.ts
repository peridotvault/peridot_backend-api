import { S3Client } from "@aws-sdk/client-s3";

export const REGION = process.env.WASABI_REGION ?? "ap-southeast-1";
export const ENDPOINT =
  process.env.WASABI_ENDPOINT ?? "https://s3.ap-southeast-1.wasabisys.com";
export const BUCKET = process.env.WASABI_BUCKET ?? "peridot-app";

export const s3 = new S3Client({
  region: REGION,
  endpoint: ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY as string,
  },
});

export function publicUrlForKey(key: string) {
  // virtual-hosted style (disarankan)
  return `https://${BUCKET}.s3.${REGION}.wasabisys.com/${encodeURI(key)}`;
}
