"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProd = exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const schema = zod_1.z.object({
    PORT: zod_1.z.string().default('4000'),
    NODE_ENV: zod_1.z.string().default('development'),
    WASABI_ENDPOINT: zod_1.z.string().url(),
    WASABI_REGION: zod_1.z.string(),
    WASABI_BUCKET: zod_1.z.string().min(1),
    WASABI_ACCESS_KEY_ID: zod_1.z.string().min(1),
    WASABI_SECRET_ACCESS_KEY: zod_1.z.string().min(1),
    PUBLIC_BASE_URL: zod_1.z.string().url(),
    CORS_ORIGIN: zod_1.z.string().optional()
});
exports.env = schema.parse(process.env);
exports.isProd = exports.env.NODE_ENV === 'production';
