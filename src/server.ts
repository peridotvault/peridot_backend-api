import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes";

const app = express();
app.use(cors());
app.use(express.json()); // boleh kecilkan kalau mau

// supaya FE bisa call `${VITE_API_BASE}/...`
app.use("/api", routes);

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
});
