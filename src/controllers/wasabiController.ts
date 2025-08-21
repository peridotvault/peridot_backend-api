import { Request, Response } from 'express';
import { z } from 'zod';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '../config/s3';
import { env } from '../config/env';

const signSchema = z.object({
    appId: z.string().min(1),

    // target area
    target: z.enum(['assets', 'announcements', 'previews', 'build', 'metadata']),

    // file info
    filename: z.string().min(1).optional(),              // metadata akan dipaksa "app.json"
    contentType: z.string().min(1).optional(),            // metadata -> application/json

    // ONLY for target = "build"
    os: z.enum(['web', 'windows', 'macos', 'linux']).optional(),
    version: z.string().optional()                        // required if os != web
});

export async function getPresignedUpload(req: Request, res: Response) {
    const parse = signSchema.safeParse({ ...req.body, ...req.query });
    if (!parse.success) {
        return res.status(400).json({ error: 'Invalid params', details: parse.error.flatten() });
    }

    const { appId, target, os, version } = parse.data;
    let { filename, contentType } = parse.data;

    const base = `icp/apps/${appId}`;

    let key: string;

    if (target === 'assets') {
        if (!filename || !contentType) return res.status(400).json({ error: 'filename & contentType required for assets' });
        key = `${base}/assets/${filename}`;
    } else if (target === 'announcements') {
        if (!filename || !contentType) return res.status(400).json({ error: 'filename & contentType required for announcements' });
        key = `${base}/announcements/${filename}`;
    } else if (target === 'previews') {
        if (!filename || !contentType) return res.status(400).json({ error: 'filename & contentType required for previews' });
        key = `${base}/previews/${filename}`;
    } else if (target === 'build') {
        if (!os) return res.status(400).json({ error: 'os required for build' });
        if (!filename || !contentType) return res.status(400).json({ error: 'filename & contentType required for build' });

        if (os === 'web') {
            key = `${base}/builds/web/${filename}`;
        } else {
            if (!version) return res.status(400).json({ error: 'version required for build when os != web' });
            key = `${base}/builds/${os}/${version}/${filename}`;
        }
    } else {
        // metadata
        contentType = 'application/json';
        key = `${base}/metadata/app.json`;
        // filename diabaikan; diset tetap app.json
    }

    const command = new PutObjectCommand({
        Bucket: env.WASABI_BUCKET,
        Key: key,
        ContentType: contentType
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 10 * 60 }); // 10 menit
    const publicUrl = `${env.PUBLIC_BASE_URL}/${key}`;

    return res.json({ url, key, publicUrl });
}
