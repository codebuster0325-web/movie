import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set KOBIS Open API key from environment variable, falling back to the user-provided key
const KOBIS_API_KEY = process.env.KOBIS_API_KEY || "f4334ad88ebc590886e64784b0ac6bd8";

// Parse JSON payloads
app.use(express.json());

// API: Daily Box Office List
app.get("/api/boxoffice", async (req, res) => {
  const { date } = req.query;
  if (!date || typeof date !== "string") {
    res.status(400).json({ error: "Date parameter (YYYYMMDD) is required" });
    return;
  }

  try {
    const url = `http://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${KOBIS_API_KEY}&targetDt=${date}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch daily box office: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/boxoffice:", error);
    res.status(500).json({ error: error.message || "Failed to load box office list." });
  }
});

// API: Movie Details info
app.get("/api/movie", async (req, res) => {
  const { movieCd } = req.query;
  if (!movieCd || typeof movieCd !== "string") {
    res.status(400).json({ error: "movieCd parameter is required" });
    return;
  }

  try {
    const url = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${KOBIS_API_KEY}&movieCd=${movieCd}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch movie info: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/movie:", error);
    res.status(500).json({ error: error.message || "Failed to load movie info." });
  }
});

// Vite or Static file middleware
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupViteOrStatic();
