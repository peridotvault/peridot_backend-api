"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3_1 = require("./../lib/s3");
const r = (0, express_1.Router)();
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
        if (!key)
            return res.status(400).json({ error: "key is required" });
        const cmd = new client_s3_1.PutObjectCommand({
            Bucket: s3_1.BUCKET,
            Key: key,
            ContentType: contentType || "application/octet-stream",
            ACL: isPublic ? "public-read" : undefined,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(s3_1.s3, cmd, { expiresIn: 900 }); // 15 menit
        const publicUrl = (0, s3_1.publicUrlForKey)(key);
        res.json({ url, key, publicUrl });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message || String(e) });
    }
});
r.post("/sign-get", async (req, res) => {
    try {
        const { key, expiresIn } = req.body ?? {};
        if (!key)
            return res.status(400).json({ error: "key is required" });
        // max 7 hari (604800 detik) untuk SigV4
        const secs = Math.min(Number(expiresIn) || 3600, 7 * 24 * 3600);
        const url = await (0, s3_request_presigner_1.getSignedUrl)(s3_1.s3, new client_s3_1.GetObjectCommand({
            Bucket: s3_1.BUCKET,
            Key: key,
        }), { expiresIn: secs });
        res.json({ url });
    }
    catch (e) {
        console.error("sign-get error:", e);
        res.status(500).json({ error: e.message || String(e) });
    }
});
exports.default = r;
