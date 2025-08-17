"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPresignedUpload = getPresignedUpload;
const zod_1 = require("zod");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3_1 = require("../config/s3");
const env_1 = require("../config/env");
const signSchema = zod_1.z.object({
    appId: zod_1.z.string().min(1),
    // target area
    target: zod_1.z.enum(['cover', 'previews', 'build', 'metadata']),
    // file info
    filename: zod_1.z.string().min(1).optional(), // metadata akan dipaksa "app.json"
    contentType: zod_1.z.string().min(1).optional(), // metadata -> application/json
    // ONLY for target = "build"
    os: zod_1.z.enum(['web', 'windows', 'macos', 'linux']).optional(),
    version: zod_1.z.string().optional() // required if os != web
});
async function getPresignedUpload(req, res) {
    const parse = signSchema.safeParse({ ...req.body, ...req.query });
    if (!parse.success) {
        return res.status(400).json({ error: 'Invalid params', details: parse.error.flatten() });
    }
    const { appId, target, os, version } = parse.data;
    let { filename, contentType } = parse.data;
    const base = `icp/apps/${appId}`;
    let key;
    if (target === 'cover') {
        if (!filename || !contentType)
            return res.status(400).json({ error: 'filename & contentType required for cover' });
        key = `${base}/cover/${filename}`;
    }
    else if (target === 'previews') {
        if (!filename || !contentType)
            return res.status(400).json({ error: 'filename & contentType required for previews' });
        key = `${base}/previews/${filename}`;
    }
    else if (target === 'build') {
        if (!os)
            return res.status(400).json({ error: 'os required for build' });
        if (!filename || !contentType)
            return res.status(400).json({ error: 'filename & contentType required for build' });
        if (os === 'web') {
            key = `${base}/builds/web/${filename}`;
        }
        else {
            if (!version)
                return res.status(400).json({ error: 'version required for build when os != web' });
            key = `${base}/builds/${os}/${version}/${filename}`;
        }
    }
    else {
        // metadata
        contentType = 'application/json';
        key = `${base}/metadata/app.json`;
        // filename diabaikan; diset tetap app.json
    }
    const command = new client_s3_1.PutObjectCommand({
        Bucket: env_1.env.WASABI_BUCKET,
        Key: key,
        ContentType: contentType
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)(s3_1.s3, command, { expiresIn: 10 * 60 }); // 10 menit
    const publicUrl = `${env_1.env.PUBLIC_BASE_URL}/${key}`;
    return res.json({ url, key, publicUrl });
}
