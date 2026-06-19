import { useState } from 'react';
import axios from 'axios';
import './Auth.css';

interface AuthProps {
  onSuccess: (token: string) => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const response = await axios.post('http://localhost:3000/login', { email, password });
        onSuccess(response.data.access_token);
      } else {
        await axios.post('http://localhost:3000/users', { name, email, password });
        const response = await axios.post('http://localhost:3000/login', { email, password });
        onSuccess(response.data.access_token);
      }
    // 2. Mudamos para 'unknown'
    } catch (err: unknown) {
      // 3. Verificamos com segurança se é um erro do Axios
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Ocorreu um erro na autenticação.');
      } else {
        setError('Ocorreu um erro inesperado.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? 'Iniciar Sessão' : 'Criar Conta'}</h2>
        
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <input 
              type="text" 
              placeholder="O seu nome" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          )}
          <input 
            type="email" 
            placeholder="O seu e-mail" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Palavra-passe" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="auth-button">
            {isLogin ? 'Entrar' : 'Registar'}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? 'Ainda não tem conta? ' : 'Já tem uma conta? '}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Registe-se aqui' : 'Inicie sessão'}
          </span>
        </p>
      </div>
    </div>
  );
}