import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserSignupDto } from '../../src/dtos/auth/signup.dto';
import { LoginDto } from '../../src/dtos/auth/login.dto';

export class AuthTestHelper {
  constructor(private readonly app: INestApplication) {}

  async createUser(userData: UserSignupDto) {
    return request(this.app.getHttpServer())
      .post('/v1/auth/signup')
      .send(userData);
  }

  async login(credentials: LoginDto) {
    return request(this.app.getHttpServer())
      .post('/v1/auth/login')
      .send(credentials);
  }

  async getAuthToken(credentials: LoginDto): Promise<string> {
    const response = await this.login(credentials);
    return response.body.token;
  }
}
