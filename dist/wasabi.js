"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3 = void 0;
exports.basePrefix = basePrefix;
exports.putJson = putJson;
exports.presignPutObject = presignPutObject;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const endpoint = process.env.WASABI_ENDPOINT;
const region = process.env.WASABI_REGION;
const bucket = process.env.WASABI_BUCKET;
const pubBase = process.env.PUBLIC_BASE; // https://<bucket>.s3.ap-southeast-1.wasabisys.com
exports.s3 = new client_s3_1.S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
        secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
    },
});
function basePrefix(appId) {
    // peridot-app/icp/apps/<appId>/...
    return `icp/apps/${appId}`;
}
async function putJson(key, body) {
    const cmd = new client_s3_1.PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(JSON.stringify(body)),
        ContentType: "application/json",
    });
    await exports.s3.send(cmd);
}
async function presignPutObject(key, contentType, expiresIn = 900) {
    const cmd = new client_s3_1.PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)(exports.s3, cmd, { expiresIn });
    const publicUrl = `${pubBase}/${key}`;
    return { url, publicUrl, key };
}
