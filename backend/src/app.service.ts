import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

export interface NewsItem {
  id: number;
  title: string;
  source: string;
  url: string;
  published_at: Date;
}

export class RegisterDto {
  name?: string;
  email?: string;
  password?: string;
}

// Transformado em CLASS
export class LoginDto {
  email?: string;
  password?: string;
}

export interface UserRow {
  id?: number;
  name?: string;
  email?: string;
  password?: string;
}

@Injectable()
export class AppService {
  private pool: Pool;

  private readonly AVAILABLE_CATEGORIES = [
    'Tecnologia',
    'Inteligência Artificial',
    'Programação',
    'Segurança',
    'Negócios',
    'Inovação',
  ];

  constructor(private jwtService: JwtService) {
    this.pool = new Pool({
      user: 'admin',
      password: 'adminpassword',
      host: '127.0.0.1',
      port: 5432,
      database: 'newsletter',
    });
    this.initDatabase();
  }

  private async initDatabase() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);
  }

  async getNews(page: number = 1, limit: number = 10, period?: string) {
    let dateFilter = '';

    // Constrói o filtro de data com base no parâmetro
    if (period === 'day')
      dateFilter = "WHERE published_at >= NOW() - INTERVAL '1 day'";
    else if (period === 'week')
      dateFilter = "WHERE published_at >= NOW() - INTERVAL '7 days'";
    else if (period === 'month')
      dateFilter = "WHERE published_at >= NOW() - INTERVAL '1 month'";

    // Calcula quantas notícias saltar com base na página atual
    const offset = (page - 1) * limit;

    const query = `
      SELECT * FROM news 
      ${dateFilter}
      ORDER BY published_at DESC 
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `SELECT COUNT(*) FROM news ${dateFilter}`;

    const [result, countResult] = await Promise.all([
      this.pool.query(query, [limit, offset]),
      this.pool.query(countQuery),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const rawCount = countResult.rows[0]?.count;
    const totalCount = parseInt(String(rawCount || 0), 10);

    return {
      data: result.rows as NewsItem[],
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  // Adicione este bloco dentro da classe AppService
  getAvailablePreferences(): string[] {
    return this.AVAILABLE_CATEGORIES;
  }

  async registerUser(userData: RegisterDto) {
    const { name, email, password } = userData;

    if (!name || !email || !password) {
      throw new ConflictException('Nome, e-mail e senha são obrigatórios.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const result = await this.pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, hashedPassword],
      );
      return result.rows[0] as UserRow;

      // Usamos unknown e tipamos a constante de erro de forma segura
    } catch (error: unknown) {
      const pgError = error as { code?: string };
      if (pgError?.code === '23505') {
        throw new ConflictException('Este e-mail já está em uso.');
      }
      throw error;
    }
  }

  async login(credentials: LoginDto) {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new UnauthorizedException('E-mail e senha são obrigatórios.');
    }

    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );
    const user = result.rows[0] as UserRow;

    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(password, user.password))
    ) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { name: user.name, email: user.email },
    };
  }

  async getUserPreferences(userId: string): Promise<string[]> {
    const result = await this.pool.query(
      'SELECT categories FROM user_preferences WHERE user_id = $1',
      [userId],
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const categories = (result.rows[0]?.categories as string[]) || [];
    return categories;
  }

  async updateUserPreferences(
    userId: string,
    categories: string[],
  ): Promise<string[]> {
    // Atualiza ou insere as preferências do usuário no banco
    await this.pool.query(
      `INSERT INTO user_preferences (user_id, categories) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id) 
       DO UPDATE SET categories = $2`,
      [userId, categories],
    );
    return categories;
  }
}
