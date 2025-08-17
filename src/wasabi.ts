import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.WASABI_ENDPOINT!;
const region = process.env.WASABI_REGION!;
const bucket = process.env.WASABI_BUCKET!;
const pubBase = process.env.PUBLIC_BASE!; // https://<bucket>.s3.ap-southeast-1.wasabisys.com

export const s3 = new S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.WASABI_ACCESS_KEY_ID!,
        secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY!,
    },
});

export function basePrefix(appId: string) {
    // peridot-app/icp/apps/<appId>/...
    return `icp/apps/${appId}`;
}

export async function putJson(key: string, body: unknown) {
    const cmd = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(JSON.stringify(body)),
        ContentType: "application/json",
    });
    await s3.send(cmd);
}

export async function presignPutObject(key: string, contentType: string, expiresIn = 900) {
    const cmd = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
    });
    const url = await getSignedUrl(s3, cmd, { expiresIn });
    const publicUrl = `${pubBase}/${key}`;
    return { url, publicUrl, key };
}
