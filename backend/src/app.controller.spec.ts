import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  // Criamos um "duplo" (mock) do AppService para não acedermos à base de dados real durante os testes
  const mockAppService = {
    getNews: jest.fn(),
    registerUser: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('deve estar definido', () => {
    expect(appController).toBeDefined();
  });

  describe('Rotas de Notícias', () => {
    it('deve retornar uma lista de notícias (GET /news)', async () => {
      const resultadoEsperado = [{ id: 1, title: 'Notícia de Teste' }];
      mockAppService.getNews.mockResolvedValue(resultadoEsperado);

      expect(await appController.getAllNews()).toBe(resultadoEsperado);
    });
  });

  describe('Rotas de Autenticação', () => {
    it('deve registar um novo utilizador (POST /users)', async () => {
      const dadosRegisto = {
        name: 'João',
        email: 'joao@teste.com',
        password: '123',
      };
      const utilizadorCriado = { id: 1, name: 'João', email: 'joao@teste.com' };

      mockAppService.registerUser.mockResolvedValue(utilizadorCriado);

      expect(await appController.register(dadosRegisto)).toBe(utilizadorCriado);
    });

    it('deve fazer login e devolver um token (POST /login)', async () => {
      const dadosLogin = { email: 'joao@teste.com', password: '123' };
      const respostaLogin = {
        access_token: 'token-falso-123',
        user: { name: 'João', email: 'joao@teste.com' },
      };

      mockAppService.login.mockResolvedValue(respostaLogin);

      expect(await appController.login(dadosLogin)).toBe(respostaLogin);
    });
  });
});
