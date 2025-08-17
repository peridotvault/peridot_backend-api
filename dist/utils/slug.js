"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeFilename = sanitizeFilename;
exports.todayYMD = todayYMD;
function sanitizeFilename(name) {
    return name
        .normalize('NFKD')
        .replace(/[^\w.-]+/g, '-') // non-word -> dash
        .replace(/-+/g, '-') // collapse dashes
        .replace(/^-|-$/g, '') // trim
        .slice(0, 120); // limit length
}
function todayYMD() {
    const d = new Date();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    return `${d.getUTCFullYear()}-${mm}-${dd}`;
}
