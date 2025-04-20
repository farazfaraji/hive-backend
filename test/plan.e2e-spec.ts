import { INestApplication } from '@nestjs/common';
import { AuthTestHelper } from './helpers/auth.helper';
import { PlanTestHelper } from './helpers/plan.helper';
import {
  setupTestDatabase,
  cleanupTestDatabase,
  clearCollection,
} from './setup';
import { UserSignupDto } from '../src/dtos/auth/signup.dto';
import { LoginDto } from '../src/dtos/auth/login.dto';
import { Language } from '../src/schemas/word.schema';

describe('PlanController (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthTestHelper;
  let planHelper: PlanTestHelper;

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
    planHelper = new PlanTestHelper(app);
  });

  beforeEach(async () => {
    await clearCollection('users');
    await clearCollection('plans');
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await app.close();
  });

  describe('POST /v1/plan/language', () => {
    it('should create a language plan for authenticated user', async () => {
      // First create and login user
      await authHelper.createUser(testUser);
      const loginResponse = await authHelper.login(loginCredentials);
      const token = loginResponse.body.token;

      // Create language plan
      const response = await planHelper.createLanguagePlan(token);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('course', 'Language');
      expect(response.body).toHaveProperty('user');
    });

    it('should not create a language plan without authentication', async () => {
      const response = await planHelper.createLanguagePlan('');
      expect(response.status).toBe(401);
    });
  });
});
