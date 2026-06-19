import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AppService, RegisterDto, LoginDto } from './app.service';
import { AuthGuard } from '../auth.guard';
import type { RequestWithUser } from '../auth.guard';

export class NewsFilterDto {
  page?: string;
  limit?: string;
  period?: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('news')
  async getAllNews(@Query() filtros: NewsFilterDto) {
    const pageNumber = filtros.page ? parseInt(filtros.page) : 1;
    const limitNumber = filtros.limit ? parseInt(filtros.limit) : 10;

    return await this.appService.getNews(
      pageNumber,
      limitNumber,
      filtros.period,
    );
  }

  @Post('users')
  async register(@Body() body: RegisterDto) {
    return await this.appService.registerUser(body);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return await this.appService.login(body);
  }

  @Get('preferences')
  getPreferences() {
    return this.appService.getAvailablePreferences();
  }

  @UseGuards(AuthGuard)
  @Get('users/me/preferences')
  async getMyPreferences(@Req() req: RequestWithUser) {
    return await this.appService.getUserPreferences(String(req.user.sub));
  }

  @UseGuards(AuthGuard)
  @Put('users/me/preferences')
  async updateMyPreferences(
    @Req() req: RequestWithUser,
    @Body() body: { categories: string[] },
  ) {
    return await this.appService.updateUserPreferences(
      String(req.user.sub),
      body.categories,
    );
  }
}
