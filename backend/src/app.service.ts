import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

// Criamos uma interface para tipar os dados que vêm do banco
export interface NewsItem {
  id: number;
  title: string;
  source: string;
  url: string;
  published_at: Date;
}

@Injectable()
export class AppService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      user: 'admin',
      password: 'adminpassword',
      host: 'localhost',
      port: 5432,
      database: 'newsletter',
    });
  }

  // Avisamos que a função retorna um Array de NewsItem
  async getNews(): Promise<NewsItem[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM news ORDER BY published_at DESC LIMIT 50',
      );
      // O "as NewsItem[]" resolve o erro do any[]
      return result.rows as NewsItem[];
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      throw error;
    }
  }
}
