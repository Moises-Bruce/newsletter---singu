import { useEffect, useState } from 'react';
import axios from 'axios';
import Auth from './Auth';
import './App.css';

interface NewsItem {
  id: number;
  title: string;
  source: string;
  url: string;
  published_at: string;
}

function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  // Verifica se o utilizador já tem um token guardado no navegador
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    // Se não houver token, nem sequer tenta buscar as notícias
    if (!token) return;

    // Se houver token, faz o pedido com o cabeçalho de autorização
    axios.get('http://localhost:3000/news', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => setNews(response.data))
      .catch(error => {
        console.error('Erro ao buscar notícias:', error);
        // Se o token estiver expirado ou inválido, limpa a sessão
        if (error.response?.status === 401) handleLogout();
      });
  }, [token]);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Se não estiver logado, mostra o ecrã de Autenticação
  if (!token) {
    return <Auth onSuccess={handleLoginSuccess} />;
  }

  // Se estiver logado, mostra as notícias
  return (
    <div className="container">
      <header className="header">
        <h1>Newsletter Inteligente</h1>
        <p>Curadoria automática das principais notícias de tecnologia</p>
        <button onClick={handleLogout} style={{ marginTop: '15px', cursor: 'pointer', padding: '8px 16px' }}>
          Terminar Sessão
        </button>
      </header>
      
      <main className="cards-grid">
        {news.map(item => (
          <article key={item.id} className="card">
            <h2>{item.title}</h2>
            <p className="source">Fonte: {item.source}</p>
            <p className="date">Publicado em: {new Date(item.published_at).toLocaleDateString('pt-PT')}</p>
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