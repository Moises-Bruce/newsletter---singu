/* eslint-disable */
// @ts-nocheck
import { useEffect, useState } from 'react';
import axios from 'axios';
import Auth from './Auth';
import Preferences from './Preferences';
import './App.css';

function App() {
  const [news, setNews] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [showPreferences, setShowPreferences] = useState(false);
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState<string>('all');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!token) return;
    const periodQuery = period !== 'all' ? `&period=${period}` : '';
    axios.get(`http://localhost:3000/news?page=${page}&limit=10${periodQuery}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setNews(response.data.data);
        setTotalPages(response.data.totalPages);
      })
      .catch(error => {
        if (error.response?.status === 401) handleLogout();
      });
  }, [token, page, period]);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) return <Auth onSuccess={handleLoginSuccess} />;

  return (
    <div className="container">
      <header className="header">
        <h1>Newsletter Inteligente</h1>
        <p>Curadoria automática das principais notícias de tecnologia</p>
        
        <div className="actions">
          <button onClick={() => setShowPreferences(true)} style={{ cursor: 'pointer', padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
            ⚙️ Minhas Preferências
          </button>
          <button onClick={handleLogout} style={{ cursor: 'pointer', padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
            Terminar Sessão
          </button>
        </div>

        <div className="filter-buttons">
          <button onClick={() => { setPeriod('all'); setPage(1); }} disabled={period === 'all'}>Todas</button>
          <button onClick={() => { setPeriod('day'); setPage(1); }} disabled={period === 'day'}>Últimas 24h</button>
          <button onClick={() => { setPeriod('week'); setPage(1); }} disabled={period === 'week'}>Última Semana</button>
          <button onClick={() => { setPeriod('month'); setPage(1); }} disabled={period === 'month'}>Último Mês</button>
        </div>
      </header>
      
      {showPreferences && <Preferences token={token} onClose={() => setShowPreferences(false)} />}

      <main className="cards-grid">
        {news.length === 0 ? (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>Nenhuma notícia encontrada.</p>
        ) : (
          news.map(item => (
            <article key={item.id} className="card">
              <h2>{item.title}</h2>
              <p className="source">Fonte: {item.source}</p>
              <p className="date">Data: {new Date(item.published_at).toLocaleDateString('pt-BR')}</p>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="read-more">Ler notícia completa →</a>
            </article>
          ))
        )}
      </main>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(page - 1)} disabled={page === 1}>Anterior</button>
          <span style={{ fontWeight: '500' }}>Página {page} de {totalPages}</span>
          <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Próxima</button>
        </div>
      )}
    </div>
  );
}

export default App;