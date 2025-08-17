import { Router } from "express";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BUCKET, s3, publicUrlForKey } from "./../lib/s3";

const r = Router();

/**
 * Body:
 * {
 *   "key": "icp/apps/<appId>/cover/filename.png",
 *   "contentType": "image/png",
 *   "public": true
 * }
 */
r.post("/sign", async (req, res) => {
    try {
        const { key, contentType, public: isPublic } = req.body ?? {};
        if (!key) return res.status(400).json({ error: "key is required" });

        const cmd = new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            ContentType: contentType || "application/octet-stream",
            ACL: isPublic ? "public-read" : undefined,
        });

        const url = await getSignedUrl(s3, cmd, { expiresIn: 900 }); // 15 menit
        const publicUrl = publicUrlForKey(key);

        res.json({ url, key, publicUrl });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: e.message || String(e) });
    }
});

r.post("/sign-get", async (req, res) => {
    try {
        const { key, expiresIn } = req.body ?? {};
        if (!key) return res.status(400).json({ error: "key is required" });

        // max 7 hari (604800 detik) untuk SigV4
        const secs = Math.min(Number(expiresIn) || 3600, 7 * 24 * 3600);
        const url = await getSignedUrl(s3, new GetObjectCommand({
            Bucket: BUCKET,
            Key: key,
        }), { expiresIn: secs });

        res.json({ url });
    } catch (e: any) {
        console.error("sign-get error:", e);
        res.status(500).json({ error: e.message || String(e) });
    }
});

export default r;
