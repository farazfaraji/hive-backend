import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import process from 'process';
import { MongoClient } from 'mongodb';
import axios, { AxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { UserSignupDto } from 'src/dtos/auth/signup.dto';
import { LoginDto } from 'src/dtos/auth/login.dto';

export const deleteAllDocumentsInCollection = async (
  collectionName: string,
  filter: any = {},
) => {
  const uri = 'mongodb://admin:admin@localhost:27016/test?authSource=admin';
  if (!uri) {
    throw new Error('MONGODB_URI_LOCAL environment variable is not defined');
  }

  try {
    const client = await MongoClient.connect(uri);
    const db = client.db('test');
    const collection = db.collection(collectionName);
    await collection.deleteMany(filter);
    await client.close();
  } catch (error) {
    console.error('Error in deleteAllDocumentsInCollection:', error);
    throw error;
  }
};

export const getTestData = async <T>(
  collectionName: string,
  filter: any = {},
): Promise<T[]> => {
  const uri = 'mongodb://admin:admin@localhost:27016/test?authSource=admin';
  if (!uri) {
    throw new Error('MONGODB_URI_LOCAL environment variable is not defined');
  }

  try {
    const client = await MongoClient.connect(uri);
    const db = client.db('test');
    const collection = db.collection(collectionName);
    const data = await collection.find(filter).toArray();
    await client.close();
    return data as T[];
  } catch (error) {
    console.error('Error in getTestData:', error);
    throw error;
  }
};

export const callOctopus = async (
  method: 'POST' | 'GET' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
) => {
  const config: AxiosRequestConfig = {
    method,
    url: `${process.env.OCTOPUS_SERVICE_URL}${url}`,
    data,
  };
  try {
    const response = await axios(config);
    if (!response.status) {
      if (response.data.msg) {
        throw new Error(response.data.msg);
      }
      throw new Error('Unknown error');
    }
    return response.data.data;
  } catch (e) {
    throw new Error(e);
  }
};

export const clearOctopus = async () => {
  await callOctopus('DELETE', '/sandbox/clear');
};

export const randomUUID = () => {
  return uuidv4();
};

export const createTestUser = async (
  app: INestApplication,
  userData: Partial<UserSignupDto> = {},
): Promise<request.Response> => {
  const defaultUserData: UserSignupDto = {
    email: 'test@example.com',
    password: 'Test123!@#',
    passwordConfirm: 'Test123!@#',
    firstname: 'Test',
    lastname: 'User',
    phone: '1234567890',
    ...userData,
  };

  return request(app.getHttpServer())
    .post('/v1/auth/signup')
    .send(defaultUserData);
};

export const loginTestUser = async (
  app: INestApplication,
  credentials: Partial<LoginDto> = {},
): Promise<request.Response> => {
  const defaultCredentials: LoginDto = {
    email: 'test@example.com',
    password: 'Test123!@#',
    ...credentials,
  };

  return request(app.getHttpServer())
    .post('/v1/auth/login')
    .send(defaultCredentials);
};
