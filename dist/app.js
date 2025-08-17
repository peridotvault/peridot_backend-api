"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Pasang router di /api DAN root agar panggilan lama tanpa /api tetap jalan
app.use('/api', routes_1.default);
app.use('/', routes_1.default);
// Error handler
app.use((err, _req, res, _next) => {
    console.error(err);
    const code = err.status || 500;
    res.status(code).json({ error: err.message ?? 'Internal Server Error' });
});
exports.default = app;
