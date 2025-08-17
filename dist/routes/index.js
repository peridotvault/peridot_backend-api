"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wasabi_1 = __importDefault(require("./wasabi"));
const apps_1 = __importDefault(require("./apps")); // punyamu sendiri
const files_1 = __importDefault(require("./files"));
const r = (0, express_1.Router)();
r.get("/health", (_req, res) => res.json({ ok: true }));
r.use("/wasabi", wasabi_1.default);
r.use("/apps", apps_1.default);
r.use("/files", files_1.default);
exports.default = r;
