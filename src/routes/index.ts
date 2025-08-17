import { Router } from "express";
import wasabi from "./wasabi";
import apps from "./apps"; // punyamu sendiri
import files from "./files";

const r = Router();

r.get("/health", (_req, res) => res.json({ ok: true }));
r.use("/wasabi", wasabi);
r.use("/apps", apps);
r.use("/files", files);

export default r;
