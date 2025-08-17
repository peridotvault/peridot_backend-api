"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3 = exports.BUCKET = exports.ENDPOINT = exports.REGION = void 0;
exports.publicUrlForKey = publicUrlForKey;
const client_s3_1 = require("@aws-sdk/client-s3");
exports.REGION = process.env.WASABI_REGION ?? "ap-southeast-1";
exports.ENDPOINT = process.env.WASABI_ENDPOINT ?? "https://s3.ap-southeast-1.wasabisys.com";
exports.BUCKET = process.env.WASABI_BUCKET ?? "peridot-app";
exports.s3 = new client_s3_1.S3Client({
    region: exports.REGION,
    endpoint: exports.ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
        secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
    },
});
function publicUrlForKey(key) {
    // virtual-hosted style (disarankan)
    return `https://${exports.BUCKET}.s3.${exports.REGION}.wasabisys.com/${encodeURI(key)}`;
}
