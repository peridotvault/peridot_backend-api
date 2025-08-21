import { Request, Response } from 'express';
import { z } from 'zod';
import {
    PutObjectCommand,
    HeadObjectCommand
} from '@aws-sdk/client-s3';
import { s3 } from '../config/s3';
import { env } from '../config/env';

const initSchema = z.object({
    appId: z.string().min(1),
    // optional seed metadata
    title: z.string().optional(),
    description: z.string().optional(),
    price: z.number().int().nonnegative().optional()
});

async function ensureMarker(key: string) {
    // buat "folder marker" zero-byte object (opsional, biar keliatan di browser)
    try {
        await s3.send(
            new HeadObjectCommand({ Bucket: env.WASABI_BUCKET, Key: key })
        );
        // already exists
    } catch {
        await s3.send(
            new PutObjectCommand({
                Bucket: env.WASABI_BUCKET,
                Key: key,
                Body: '',
                ContentType: 'application/x-directory'
            })
        );
    }
}

export async function initAppStorage(req: Request, res: Response) {
    const parse = initSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Invalid params', details: parse.error.flatten() });
    }

    const { appId, title, description, price } = parse.data;

    const base = `icp/apps/${appId}/`;

    // folder markers (opsional)
    const markers = [
        base,
        `${base}assets/`,
        `${base}announcements/`,
        `${base}previews/`,
        `${base}builds/`,
        `${base}builds/web/`,
        `${base}builds/windows/`,
        `${base}builds/macos/`,
        `${base}builds/linux/`,
        `${base}metadata/`
    ];

    for (const k of markers) await ensureMarker(k);

    // seed metadata/app.json (kalau belum ada)
    const appJsonKey = `${base}metadata/app.json`;
    try {
        await s3.send(new HeadObjectCommand({ Bucket: env.WASABI_BUCKET, Key: appJsonKey }));
        // exist -> skip
    } catch {
        const seed = {
            appId,
            title: title ?? '',
            description: description ?? '',
            price: price ?? 0,
            createdAt: new Date().toISOString(),
            distributions: { web: [], windows: {}, macos: {}, linux: {} }
        };
        await s3.send(
            new PutObjectCommand({
                Bucket: env.WASABI_BUCKET,
                Key: appJsonKey,
                ContentType: 'application/json',
                Body: JSON.stringify(seed, null, 2)
            })
        );
    }

    return res.json({ ok: true, base });
}
