import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export class PlanTestHelper {
  constructor(private readonly app: INestApplication) {}

  async createLanguagePlan(token: string) {
    return request(this.app.getHttpServer())
      .post('/v1/plan/language')
      .set('Authorization', `Bearer ${token}`);
  }
}
