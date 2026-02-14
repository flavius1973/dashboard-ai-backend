const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const YOUTUBE_KEY = "AIzaSyAJdgF5nfWE6xOsleHw7wIlL48HZowJOMM";
const NEWS_KEY = "61e88c37873c438b85bbdaca81d10cd0";

const PORT = process.env.PORT || 3000;

/*
FUNÇÃO: data limite de 2 dias
*/
function dataDoisDiasAtras(){
  const data = new Date();
  data.setDate(data.getDate() - 2);
  return data.toISOString();
}

/*
MAPA DE CONTEXTO DAS CATEGORIAS
Evita conteúdo fora do tema
*/
const contextoCategorias = {
  "Tecnologia": "tecnologia inovação startups software",
  "Inteligência Artificial": "inteligencia artificial IA machine learning",
  "Negócios": "empresas mercado economia empreendedorismo",
  "Finanças": "financas economia dinheiro credito",
  "Investimentos": "investimentos bolsa de valores acoes criptomoedas",
  "Marketing": "marketing digital branding vendas",
  "Carreira": "carreira trabalho profissao vagas",
  "Saúde": "saude medicina bem estar",
  "Fitness": "fitness treino academia exercicios",
  "Alimentação": "alimentacao nutricao dieta saudavel",
  "Espiritualidade": "espiritualidade fe meditacao",
  "Educação": "educacao ensino aprendizado",
  "Ciência": "ciencia descobertas pesquisa",
  "Entretenimento": "entretenimento cinema series celebridades",
  "Esportes": "esportes futebol competicoes atletas"
};

/*
BUSCAR VIDEOS RELEVANTES
- recentes
- populares
- pt-br
*/
async function buscarVideos(tema){

  const contexto = contextoCategorias[tema] || tema;
  const query = `${tema} ${contexto} noticias tendencias`;

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=15&type=video&order=viewCount&publishedAfter=${dataDoisDiasAtras()}&relevanceLanguage=pt&regionCode=BR&key=${YOUTUBE_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.items) return [];

  return data.items.map(v => ({
    id: v.id.videoId,
    titulo: v.snippet.title,
    thumb: v.snippet.thumbnails.medium.url,
    data: v.snippet.publishedAt
  }));
}

/*
BUSCAR NOTÍCIAS RELEVANTES
- populares
- recentes
- com imagem
- pt-br
*/
async function buscarNoticias(tema){

  const contexto = contextoCategorias[tema] || tema;
  const dataLimite = dataDoisDiasAtras().split("T")[0];

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(contexto)}&language=pt&from=${dataLimite}&sortBy=popularity&pageSize=15&apiKey=${NEWS_KEY}`;
  
  const res = await fetch(url);
  const data = await res.json();

  if (!data.articles) return [];

  return data.articles
    .filter(n => n.urlToImage)
    .map(n => ({
      titulo: n.title,
      url: n.url,
      imagem: n.urlToImage,
      fonte: n.source.name,
      data: n.publishedAt
    }));
}

/*
ROTA PRINCIPAL DO ORBESNET
*/
app.post("/conteudo", async (req, res) => {

  const temas = req.body.temas;
  const resposta = [];

  for (let tema of temas) {

    const videos = await buscarVideos(tema);
    const noticias = await buscarNoticias(tema);

    // ordenar por mais recentes
    videos.sort((a,b) => new Date(b.data) - new Date(a.data));
    noticias.sort((a,b) => new Date(b.data) - new Date(a.data));

    resposta.push({
      tema,
      videos: videos.slice(0,3),
      noticias: noticias.slice(0,3)
    });
  }

  res.json(resposta);
});

/*
INICIAR SERVIDOR
*/
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));
