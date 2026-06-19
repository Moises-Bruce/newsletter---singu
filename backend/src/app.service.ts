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

// Transformado em CLASS para funcionar com o @Body() do NestJS
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

  async getNews(): Promise<NewsItem[]> {
    const result = await this.pool.query(
      'SELECT * FROM news ORDER BY published_at DESC LIMIT 50',
    );
    return result.rows as NewsItem[];
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
}
