const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

// rota de teste
app.get("/", (req, res) => {
  res.send("Servidor online");
});

// ⚠️ COLOQUE SUAS CHAVES COMPLETAS AQUI
const YOUTUBE_KEY = "AIzaSyAJdgF5nfWE6xOsleHw7wIlL48HZowJOMM";
const NEWS_KEY = "61e88c37873c438b85bbdaca81d10cd0";


// buscar vídeos
async function buscarVideos(tema) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${tema}&maxResults=3&type=video&order=viewCount&key=${YOUTUBE_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items) return [];

    return data.items.map(v => ({
      id: v.id.videoId,
      titulo: v.snippet.title,
      thumb: v.snippet.thumbnails.medium.url
    }));
  } catch (erro) {
    console.log("Erro ao buscar vídeos:", erro);
    return [];
  }
}

// buscar notícias
async function buscarNoticias(tema) {
  try {
    const url = `https://newsapi.org/v2/everything?q=${tema}&sortBy=popularity&pageSize=3&apiKey=${NEWS_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.articles) return [];

    return data.articles.map(n => ({
      titulo: n.title,
      url: n.url,
      fonte: n.source.name
    }));
  } catch (erro) {
    console.log("Erro ao buscar notícias:", erro);
    return [];
  }
}

// 🔥 ROTA PRINCIPAL USADA PELO DASHBOARD
app.get("/api/content", async (req, res) => {
  try {
    const tema = req.query.tema;

    if (!tema) {
      return res.status(400).json({ erro: "Tema não informado" });
    }

    const videos = await buscarVideos(tema);
    const noticias = await buscarNoticias(tema);

    res.json({ tema, videos, noticias });
  } catch (erro) {
    console.log("Erro na rota /api/content:", erro);
    res.status(500).json({ erro: "Erro ao gerar conteúdo" });
  }
});

// porta do Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor rodando na porta " + PORT);
});
