import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// O decorator @Controller('news') já define que a rota base aqui é /news
@Controller('news')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Quando alguém acessar GET /news, esta função será chamada
  @Get()
  async getAllNews() {
    return await this.appService.getNews();
  }
}
