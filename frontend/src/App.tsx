import { useEffect, useState } from 'react';
import axios from 'axios';
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
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState('all');
  const [totalPages, setTotalPages] = useState(1);
  const [token] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (!token) return;
    const periodQuery = period !== 'all' ? `&period=${period}` : '';
    axios.get(`http://localhost:3000/news?page=${page}&limit=10${periodQuery}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setNews(res.data.data);
      setTotalPages(res.data.totalPages);
    });
  }, [page, period, token]);

  return (
    <div className="container">
      {/* Botões de Filtro */}
      <div className="filters">
        <button onClick={() => { setPeriod('day'); setPage(1); }}>Hoje</button>
        <button onClick={() => { setPeriod('week'); setPage(1); }}>Semana</button>
        <button onClick={() => { setPeriod('month'); setPage(1); }}>Mês</button>
      </div>

      {/* Renderização das Notícias */}
      <main>
        {news.map(item => <div key={item.id}>{item.title}</div>)}
      </main>

      {/* Botões de Paginação */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button>
        <span>{page} de {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Próxima</button>
      </div>
    </div>
  );
}

export default App;