import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../src/app.module';

let mongod: MongoMemoryServer;
let connection: Connection;

export async function setupTestDatabase() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  const moduleRef = await Test.createTestingModule({
    imports: [MongooseModule.forRoot(uri), AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  connection = moduleRef.get<Connection>(getConnectionToken());
  return { app, connection };
}

export async function cleanupTestDatabase() {
  if (connection) {
    await connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
}

export async function clearCollection(collectionName: string) {
  if (connection) {
    await connection.db.collection(collectionName).deleteMany({});
  }
}
