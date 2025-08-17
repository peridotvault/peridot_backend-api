// src/routes/files.ts
import { Router, type Request, type Response } from "express";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { pipeline } from "node:stream/promises";

const r = Router();

const s3 = new S3Client({
    region: process.env.WASABI_REGION,
    endpoint: process.env.WASABI_ENDPOINT,
    credentials: {
        accessKeyId: process.env.WASABI_ACCESS_KEY_ID!,
        secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
});
const BUCKET = process.env.WASABI_BUCKET!;

/**
 * Streamer: URL tetap /api/files/..., tidak redirect.
 * Dukung Range header untuk video.
 */
r.use(async (req: Request, res: Response) => {
    try {
        if (req.method !== "GET") {
            return res.status(405).json({ error: "Method Not Allowed" });
        }

        // key relatif terhadap /files
        const key = decodeURIComponent(req.path.replace(/^\/+/, ""));
        if (!key) return res.status(400).json({ error: "Missing key" });

        const range = req.headers.range as string | undefined;

        const cmd = new GetObjectCommand({
            Bucket: BUCKET,
            Key: key,
            ...(range ? { Range: range } : {}),
        });

        const obj = await s3.send(cmd);

        // Set headers dari metadata S3
        if (obj.ContentType) res.setHeader("Content-Type", obj.ContentType);
        if (obj.ETag) res.setHeader("ETag", obj.ETag);
        if (obj.LastModified)
            res.setHeader("Last-Modified", obj.LastModified.toUTCString());
        if (obj.ContentLength !== undefined)
            res.setHeader("Content-Length", String(obj.ContentLength));
        res.setHeader("Accept-Ranges", "bytes");

        res.status(range ? 206 : 200);
        await pipeline(obj.Body as any, res);
    } catch (e: any) {
        res.status(500).json({ error: e.message || String(e) });
    }
});

export default r;
