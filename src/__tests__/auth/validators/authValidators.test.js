/**
 * Testes para AuthValidators
 * Testa validações de email, senha, login e registro
 */

const fs = require('fs');
const path = require('path');

// Carregar módulos necessários antes dos testes
beforeAll(() => {
  // Carregar helpers primeiro
  const helpersPath = path.join(__dirname, '../../../../public/javascripts/utils/helpers.js');
  const helpersCode = fs.readFileSync(helpersPath, 'utf8');
  eval(helpersCode);

  // Carregar AuthValidators
  const authValidatorsPath = path.join(__dirname, '../../../../public/javascripts/auth/validators/authValidators.js');
  const authValidatorsCode = fs.readFileSync(authValidatorsPath, 'utf8');
  
  // Mock das dependências necessárias
  window.LoginUI = {
    showNotification: jest.fn(),
  };
  
  window.AuthCore = {
    getToken: jest.fn(() => 'mock-token'),
    redirectToLogin: jest.fn(),
    validateToken: jest.fn(() => Promise.resolve({ exp: Math.floor(Date.now() / 1000) + 3600 })),
    isTokenExpired: jest.fn(() => false),
  };
  
  window.AuthUI = {
    showLoading: jest.fn(),
    hideLoading: jest.fn(),
  };
  
  eval(authValidatorsCode);
});

describe('AuthValidators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = '';
  });

  describe('validateRequiredFields', () => {
    test('deve retornar true quando email e senha estão preenchidos', () => {
      const result = window.AuthValidators.validateRequiredFields('test@example.com', 'password123');
      expect(result).toBe(true);
      expect(window.LoginUI.showNotification).not.toHaveBeenCalled();
    });

    test('deve retornar false quando email está vazio', () => {
      const result = window.AuthValidators.validateRequiredFields('', 'password123');
      expect(result).toBe(false);
      expect(window.LoginUI.showNotification).toHaveBeenCalledWith(
        'warning',
        'Campos obrigatórios',
        'Por favor, preencha todos os campos.',
        4000
      );
    });

    test('deve retornar false quando senha está vazia', () => {
      const result = window.AuthValidators.validateRequiredFields('test@example.com', '');
      expect(result).toBe(false);
      expect(window.LoginUI.showNotification).toHaveBeenCalled();
    });

    test('deve retornar false quando ambos estão vazios', () => {
      const result = window.AuthValidators.validateRequiredFields('', '');
      expect(result).toBe(false);
      expect(window.LoginUI.showNotification).toHaveBeenCalled();
    });
  });

  describe('validateEmail', () => {
    test('deve retornar true para email válido', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com',
        'test123@test-domain.com',
      ];

      validEmails.forEach((email) => {
        const result = window.AuthValidators.validateEmail(email);
        expect(result).toBe(true);
      });
    });

    test('deve retornar false para email inválido', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test @example.com',
        'test@example',
        '',
      ];

      invalidEmails.forEach((email) => {
        const result = window.AuthValidators.validateEmail(email);
        expect(result).toBe(false);
        expect(window.LoginUI.showNotification).toHaveBeenCalledWith(
          'warning',
          'Email inválido',
          'Por favor, insira um email válido.',
          4000
        );
      });
    });
  });

  describe('validateLoginData', () => {
    test('deve retornar true para dados válidos', () => {
      const result = window.AuthValidators.validateLoginData('test@example.com', 'password123');
      expect(result).toBe(true);
    });

    test('deve retornar false quando campos obrigatórios estão vazios', () => {
      const result = window.AuthValidators.validateLoginData('', 'password123');
      expect(result).toBe(false);
    });

    test('deve retornar false quando email é inválido', () => {
      const result = window.AuthValidators.validateLoginData('invalid-email', 'password123');
      expect(result).toBe(false);
    });
  });

  describe('validateRegisterData', () => {
    test('deve retornar true para dados válidos', () => {
      const result = window.AuthValidators.validateRegisterData(
        'test@example.com',
        'password123',
        'password123'
      );
      expect(result).toBe(true);
    });

    test('deve retornar false quando campos obrigatórios estão vazios', () => {
      const result = window.AuthValidators.validateRegisterData('', 'password123', 'password123');
      expect(result).toBe(false);
    });

    test('deve retornar false quando senhas não coincidem', () => {
      const result = window.AuthValidators.validateRegisterData(
        'test@example.com',
        'password123',
        'password456'
      );
      expect(result).toBe(false);
      expect(window.LoginUI.showNotification).toHaveBeenCalledWith(
        'warning',
        'Senhas não coincidem',
        'As senhas informadas não são iguais.',
        4000
      );
    });

    test('deve retornar false quando senha é muito curta', () => {
      const result = window.AuthValidators.validateRegisterData(
        'test@example.com',
        '12345',
        '12345'
      );
      expect(result).toBe(false);
      expect(window.LoginUI.showNotification).toHaveBeenCalledWith(
        'warning',
        'Senha muito curta',
        'A senha deve ter pelo menos 6 caracteres.',
        4000
      );
    });

    test('deve retornar false quando email é inválido', () => {
      const result = window.AuthValidators.validateRegisterData(
        'invalid-email',
        'password123',
        'password123'
      );
      expect(result).toBe(false);
    });
  });

  describe('basicTokenCheck', () => {
    test('deve retornar true quando token existe', () => {
      window.AuthCore.getToken.mockReturnValue('valid-token');
      const result = window.AuthValidators.basicTokenCheck();
      expect(result).toBe(true);
      expect(window.AuthCore.redirectToLogin).not.toHaveBeenCalled();
    });

    test('deve retornar false quando token não existe', () => {
      window.AuthCore.getToken.mockReturnValue(null);
      const result = window.AuthValidators.basicTokenCheck();
      expect(result).toBe(false);
      expect(window.AuthCore.redirectToLogin).toHaveBeenCalledWith(
        'Você precisa estar logado para acessar esta página.'
      );
    });
  });

  describe('getToken', () => {
    test('deve extrair token dos cookies', () => {
      document.cookie = 'token=test-token-123; other=value';
      const token = window.AuthValidators.getToken();
      expect(token).toBe('test-token-123');
    });

    test('deve retornar undefined quando token não existe', () => {
      document.cookie = 'other=value';
      const token = window.AuthValidators.getToken();
      expect(token).toBeUndefined();
    });
  });

  describe('isTokenExpired', () => {
    test('deve retornar true quando token está expirado', () => {
      const expiredTime = Math.floor(Date.now() / 1000) - 3600; // 1 hora atrás
      const userData = { exp: expiredTime };
      const result = window.AuthValidators.isTokenExpired(userData);
      expect(result).toBe(true);
    });

    test('deve retornar false quando token não está expirado', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hora no futuro
      const userData = { exp: futureTime };
      const result = window.AuthValidators.isTokenExpired(userData);
      expect(result).toBe(false);
    });
  });
});

