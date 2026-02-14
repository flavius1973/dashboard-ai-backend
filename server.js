const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

// rota de teste para ver se o servidor está online
app.get("/", (req, res) => {
  res.send("Servidor online");
});

// chaves das APIs (depois vamos colocar no Render como variáveis seguras)
const YOUTUBE_KEY = "SUA_KEY_YOUTUBE";
const NEWS_KEY = "SUA_KEY_NEWS";

async function buscarVideos(tema) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${tema}&maxResults=10&type=video&order=viewCount&key=${YOUTUBE_KEY}`;
    
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items) return [];

    return data.items.map(v => v.id.videoId);
  } catch (erro) {
    console.log("Erro ao buscar vídeos:", erro);
    return [];
  }
}

async function buscarNoticias(tema) {
  try {
    const url = `https://newsapi.org/v2/everything?q=${tema}&sortBy=popularity&pageSize=10&apiKey=${NEWS_KEY}`;
    
    const res = await fetch(url);
    const data = await res.json();

    if (!data.articles) return [];

    return data.articles.map(n => ({
      titulo: n.title,
      url: n.url,
      data: n.publishedAt
    }));
  } catch (erro) {
    console.log("Erro ao buscar notícias:", erro);
    return [];
  }
}

app.post("/conteudo", async (req, res) => {
  try {
    const temas = req.body.temas || [];
    const resposta = [];

    for (let tema of temas) {
      const videos = await buscarVideos(tema);
      const noticias = await buscarNoticias(tema);

      resposta.push({
        tema,
        videos: videos.slice(0, 3),
        noticias: noticias.slice(0, 3)
      });
    }

    res.json(resposta);
  } catch (erro) {
    console.log("Erro na rota /conteudo:", erro);
    res.status(500).json({ erro: "Erro ao gerar conteúdo" });
  }
});

// PORTA correta para rodar no Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor rodando na porta " + PORT);
});
