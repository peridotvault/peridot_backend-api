"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/files.ts
const express_1 = require("express");
const client_s3_1 = require("@aws-sdk/client-s3");
const promises_1 = require("node:stream/promises");
const r = (0, express_1.Router)();
const s3 = new client_s3_1.S3Client({
    region: process.env.WASABI_REGION,
    endpoint: process.env.WASABI_ENDPOINT,
    credentials: {
        accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
        secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});
const BUCKET = process.env.WASABI_BUCKET;
/**
 * Streamer: URL tetap /api/files/..., tidak redirect.
 * Dukung Range header untuk video.
 */
r.use(async (req, res) => {
    try {
        if (req.method !== "GET") {
            return res.status(405).json({ error: "Method Not Allowed" });
        }
        // key relatif terhadap /files
        const key = decodeURIComponent(req.path.replace(/^\/+/, ""));
        if (!key)
            return res.status(400).json({ error: "Missing key" });
        const range = req.headers.range;
        const cmd = new client_s3_1.GetObjectCommand({
            Bucket: BUCKET,
            Key: key,
            ...(range ? { Range: range } : {}),
        });
        const obj = await s3.send(cmd);
        // Set headers dari metadata S3
        if (obj.ContentType)
            res.setHeader("Content-Type", obj.ContentType);
        if (obj.ETag)
            res.setHeader("ETag", obj.ETag);
        if (obj.LastModified)
            res.setHeader("Last-Modified", obj.LastModified.toUTCString());
        if (obj.ContentLength !== undefined)
            res.setHeader("Content-Length", String(obj.ContentLength));
        res.setHeader("Accept-Ranges", "bytes");
        res.status(range ? 206 : 200);
        await (0, promises_1.pipeline)(obj.Body, res);
    }
    catch (e) {
        res.status(500).json({ error: e.message || String(e) });
    }
});
exports.default = r;
