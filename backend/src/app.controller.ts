import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService, RegisterDto, LoginDto } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('news')
  async getAllNews() {
    return await this.appService.getNews();
  }

  @Post('users')
  async register(@Body() body: RegisterDto) {
    return await this.appService.registerUser(body);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return await this.appService.login(body);
  }
}
