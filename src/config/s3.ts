import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env';

export const s3 = new S3Client({
    region: env.WASABI_REGION,
    endpoint: env.WASABI_ENDPOINT,
    credentials: {
        accessKeyId: env.WASABI_ACCESS_KEY_ID,
        secretAccessKey: env.WASABI_SECRET_ACCESS_KEY
    },
    forcePathStyle: true // penting untuk Wasabi/S3 kompatibel
});
