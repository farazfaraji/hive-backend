import { INestApplication } from '@nestjs/common';
import { AuthTestHelper } from './helpers/auth.helper';
import {
  setupTestDatabase,
  cleanupTestDatabase,
  clearCollection,
} from './setup';
import { UserSignupDto } from '../src/dtos/auth/signup.dto';
import { LoginDto } from '../src/dtos/auth/login.dto';
import { Language } from '../src/schemas/word.schema';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthTestHelper;

  const testUser: UserSignupDto = {
    firstname: 'Test',
    lastname: 'User',
    email: 'test@example.com',
    password: 'password123',
    passwordConfirm: 'password123',
    phone: '1234567890',
    targetLanguage: Language.English,
    language: Language.English,
    interests: ['sports', 'music'],
  };

  const loginCredentials: LoginDto = {
    email: testUser.email,
    password: testUser.password,
  };

  beforeAll(async () => {
    const { app: testApp } = await setupTestDatabase();
    app = testApp;
    authHelper = new AuthTestHelper(app);
  });

  beforeEach(async () => {
    await clearCollection('users');
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await app.close();
  });

  describe('POST /v1/auth/signup', () => {
    it('should create a new user', async () => {
      const response = await authHelper.createUser(testUser);
      expect(response.status).toBe(201);
    });

    it('should not create a user with existing email', async () => {
      await authHelper.createUser(testUser);
      const response = await authHelper.createUser(testUser);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /v1/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      await authHelper.createUser(testUser);
      const response = await authHelper.login(loginCredentials);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });

    it('should not login with incorrect password', async () => {
      await authHelper.createUser(testUser);
      const response = await authHelper.login({
        ...loginCredentials,
        password: 'wrongpassword',
      });
      expect(response.status).toBe(401);
    });

    it('should not login with non-existent email', async () => {
      const response = await authHelper.login({
        ...loginCredentials,
        email: 'nonexistent@example.com',
      });
      expect(response.status).toBe(401);
    });
  });
});
