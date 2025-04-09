import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import {
  deleteAllDocumentsInCollection,
  createTestUser,
  loginTestUser,
} from './e2e/helper/helper.test';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await deleteAllDocumentsInCollection('users');
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /v1/auth/signup', () => {
    it('should create a new user', async () => {
      const response = await createTestUser(app);
      expect(response.status).toBe(201);
      expect(response.body.status).toBe(true);
    });

    it('should fail when email already exists', async () => {
      await createTestUser(app);
      const response = await createTestUser(app);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /v1/auth/login', () => {
    beforeEach(async () => {
      await createTestUser(app);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await loginTestUser(app);

      expect(response.status).toBe(201);
      expect(response.body.token).toBeDefined();
    });

    it('should fail with invalid credentials', async () => {
      const response = await loginTestUser(app, { password: 'wrongpassword' });
      expect(response.status).toBe(401);
    });
  });
});
