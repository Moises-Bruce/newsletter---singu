import { useState, useEffect } from 'react';
import axios from 'axios';

interface PreferencesProps {
  token: string;
  onClose: () => void;
}

export default function Preferences({ token, onClose }: PreferencesProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const availableCategories = ['tecnologia', 'negócios', 'ciência', 'saúde', 'esportes', 'entretenimento'];

  useEffect(() => {
    // Busca as preferências atuais do usuário ao abrir
    axios.get('http://localhost:3000/users/me/preferences', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setCategories(res.data))
    .catch(console.error);
  }, [token]);

  const toggleCategory = (cat: string) => {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const savePreferences = async () => {
    try {
      await axios.put('http://localhost:3000/users/me/preferences', 
        { categories }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onClose(); // Fecha o painel após salvar
    } catch (error) {
      console.error("Erro ao salvar preferências", error);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px auto', borderRadius: '8px', backgroundColor: '#f9f9f9', color: '#333', maxWidth: '600px' }}>
      <h2>Escolha seus interesses</h2>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '15px 0' }}>
        {availableCategories.map(cat => (
          <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={categories.includes(cat)} 
              onChange={() => toggleCategory(cat)} 
            />
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button onClick={savePreferences} style={{ padding: '8px 16px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Salvar Preferências
        </button>
        <button onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}