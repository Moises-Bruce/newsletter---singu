import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitando o CORS
  app.enableCors();

  // O Nest roda na porta 3000 por padrão
  await app.listen(3000);
  console.log(`🚀 API rodando em: http://localhost:3000/news`);
}
bootstrap();
