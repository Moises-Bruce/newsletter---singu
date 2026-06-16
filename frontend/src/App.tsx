import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

// Interface que espelha os dados que vêm do nosso banco PostgreSQL
interface NewsItem {
  id: number;
  title: string;
  source: string;
  url: string;
  published_at: string;
}

function App() {
  const [news, setNews] = useState<NewsItem[]>([]);

  // Busca as notícias assim que a tela carrega
  useEffect(() => {
    axios.get('http://localhost:3000/news')
      .then(response => setNews(response.data))
      .catch(error => console.error('Erro ao buscar notícias:', error));
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1>Newsletter Inteligente</h1>
        <p>Curadoria automática das principais notícias de tecnologia</p>
      </header>
      
      <main className="cards-grid">
        {news.map(item => (
          <article key={item.id} className="card">
            <h2>{item.title}</h2>
            <p className="source">Fonte: {item.source}</p>
            <p className="date">Publicado em: {new Date(item.published_at).toLocaleDateString('pt-BR')}</p>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="read-more">
              Ler notícia completa
            </a>
          </article>
        ))}
      </main>
    </div>
  );
}

export default App;