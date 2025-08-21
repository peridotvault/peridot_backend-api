import { Router } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r = Router();

const REGION = process.env.WASABI_REGION || 'ap-southeast-1';
const ENDPOINT = process.env.WASABI_ENDPOINT || `https://s3.${REGION}.wasabisys.com`;
const BUCKET = process.env.WASABI_BUCKET || '';

if (!BUCKET) {
    console.error('[CONFIG] WASABI_BUCKET is missing');
}

const s3 = new S3Client({
    region: REGION,
    endpoint: ENDPOINT,
    forcePathStyle: true, // pakai path-style untuk Wasabi
    credentials: {
        accessKeyId: process.env.WASABI_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY || '',
    },
});

const ROOT = 'icp/apps';
function appPrefix(appId: string) {
    return `${ROOT}/${appId}/`;
}
const SUBFOLDERS = [
    'assets/',
    'announcements/',
    'previews/',
    'builds/web/',
    'builds/windows/',
    'builds/macos/',
    'builds/linux/',
    'metadata/',
];

async function ensureFolder(Key: string) {
    await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key,
        Body: '',
        ContentType: 'application/x-directory',
    }));
}

// POST /apps/:appId/init
r.post('/:appId/init', async (req, res, next) => {
    try {
        if (!BUCKET) {
            return res.status(500).json({ error: 'WASABI_BUCKET is not set' });
        }
        const { appId } = req.params;
        if (!appId) return res.status(400).json({ error: 'appId required' });

        const base = appPrefix(appId);

        for (const sub of SUBFOLDERS) {
            await ensureFolder(base + sub);
        }

        const prefixes = Object.fromEntries(
            SUBFOLDERS.map(s => [s.replace(/\/$/, ''), base + s])
        );

        res.json({
            bucket: BUCKET,
            basePrefix: base,
            prefixes,
        });
    } catch (err) {
        next(err);
    }
});

export default r;
