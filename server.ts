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

// Import GoogleGenAI for review generation
import { GoogleGenAI } from "@google/genai";

// API: Generate movie review with 3 keywords using Gemini
app.post("/api/review", async (req, res) => {
  const { movieNm, movieNmEn, directors, genres, showTm, keywords } = req.body;

  if (!movieNm) {
    res.status(400).json({ error: "movieNm parameter is required" });
    return;
  }

  if (!keywords || !Array.isArray(keywords) || keywords.length !== 3) {
    res.status(400).json({ error: "Exactly three keywords are required as an array." });
    return;
  }

  const [kw1, kw2, kw3] = keywords.map(kw => kw.trim()).filter(Boolean);
  if (!kw1 || !kw2 || !kw3) {
    res.status(400).json({ error: "All three keywords must be non-empty strings." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ 
      error: "GEMINI_API_KEY is not configured on the server. Please set it in your environment." 
    });
    return;
  }

  try {
    // Lazy initialize GoogleGenAI with safe options
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const directorsStr = Array.isArray(directors) 
      ? directors.map((d: any) => d.peopleNm).join(", ") 
      : "정보 없음";
    
    const genresStr = Array.isArray(genres)
      ? genres.map((g: any) => g.genreNm).join(", ")
      : "정보 없음";

    const prompt = `영화의 상세 정보를 바탕으로, 사용자가 입력한 세 개의 키워드를 '반드시 전부 자연스럽게 포함'하는 감상평(영화 리뷰)을 작성해주세요.

**영화 상세 정보:**
- 제목: ${movieNm} (영문명: ${movieNmEn || "N/A"})
- 감독: ${directorsStr}
- 장르: ${genresStr}
- 상영 시간: ${showTm || "N/A"}분

**입력한 세 개의 감상 키워드:**
1. "${kw1}"
2. "${kw2}"
3. "${kw3}"

**작성 가이드라인:**
1. 영화 비평가 또는 감수성 풍부한 관객의 시선에서 작성해 최고의 몰입감을 주세요.
2. 한국어로 자연스럽고 정교하게 200~400자 정도로 작성해 주세요.
3. 세 키워드("${kw1}", "${kw2}", "${kw3}")를 본문에 꼭 확실하게 포함시키며, 등장할 때마다 대괄호를 씌워 **[${kw1}]**, **[${kw2}]**, **[${kw3}]** 형태로 강조 표시해서 한눈에 보이게 강조해주세요.
4. 문단 전체가 자연스럽게 이어져야 하고 기계적인 문장이 아니라 전문 비평지인 '씨네21' 등이나 감각적인 SNS 리뷰처럼 매끄럽게 작성해 주세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const reviewText = response.text || "감상평을 생성할 수 없습니다. 다시 시도해 주세요.";
    res.json({ review: reviewText });
  } catch (error: any) {
    console.error("Error generating review via Gemini:", error);
    res.status(500).json({ error: error.message || "Gemini 감상평 생성 중 오류가 발생했습니다." });
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
