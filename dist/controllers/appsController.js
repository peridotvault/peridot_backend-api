"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAppStorage = initAppStorage;
const zod_1 = require("zod");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_1 = require("../config/s3");
const env_1 = require("../config/env");
const initSchema = zod_1.z.object({
    appId: zod_1.z.string().min(1),
    // optional seed metadata
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().int().nonnegative().optional()
});
async function ensureMarker(key) {
    // buat "folder marker" zero-byte object (opsional, biar keliatan di browser)
    try {
        await s3_1.s3.send(new client_s3_1.HeadObjectCommand({ Bucket: env_1.env.WASABI_BUCKET, Key: key }));
        // already exists
    }
    catch {
        await s3_1.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: env_1.env.WASABI_BUCKET,
            Key: key,
            Body: '',
            ContentType: 'application/x-directory'
        }));
    }
}
async function initAppStorage(req, res) {
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
    for (const k of markers)
        await ensureMarker(k);
    // seed metadata/app.json (kalau belum ada)
    const appJsonKey = `${base}metadata/app.json`;
    try {
        await s3_1.s3.send(new client_s3_1.HeadObjectCommand({ Bucket: env_1.env.WASABI_BUCKET, Key: appJsonKey }));
        // exist -> skip
    }
    catch {
        const seed = {
            appId,
            title: title ?? '',
            description: description ?? '',
            price: price ?? 0,
            createdAt: new Date().toISOString(),
            distributions: { web: [], windows: {}, macos: {}, linux: {} }
        };
        await s3_1.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: env_1.env.WASABI_BUCKET,
            Key: appJsonKey,
            ContentType: 'application/json',
            Body: JSON.stringify(seed, null, 2)
        }));
    }
    return res.json({ ok: true, base });
}
