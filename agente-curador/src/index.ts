import axios from 'axios';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

const API_KEY = process.env.NEWS_API_KEY;
const URL = `https://newsapi.org/v2/everything?q=tecnologia&language=pt&sortBy=publishedAt&apiKey=${API_KEY}`;

const dbClient = new Client({
  user: 'admin',
  password: 'adminpassword',
  host: 'localhost',
  port: 5432,
  database: 'newsletter',
});

async function fetchAndSaveNews() {
  try {
    console.log('Iniciando o Agente Curador...');
    
    await dbClient.connect();
    console.log('Conectado ao PostgreSQL');

    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        source TEXT,
        url TEXT UNIQUE,
        published_at TIMESTAMP
      );
    `);

    const response = await axios.get(URL);
    const articles = response.data.articles;

    let savedCount = 0;

    for (const article of articles) {
      if (!article.title || !article.url) continue;

      try {
        await dbClient.query(
          `INSERT INTO news (title, source, url, published_at) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (url) DO NOTHING`,
          [article.title, article.source?.name || 'Desconhecido', article.url, article.publishedAt]
        );

        savedCount++;
      } catch (dbError) {
        console.error(`Erro ao salvar a notícia: ${article.title}`, dbError);
      }
    }

    console.log(`${savedCount} notícias foram verificadas e salvas no banco de dados.`);

  } catch (error) {
    console.error('❌ Ocorreu um erro no processo.', error);
  } finally {
    await dbClient.end();
  }
}

fetchAndSaveNews();