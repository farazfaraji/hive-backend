import { Model, UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';
import { SchemaBase } from './schema.abstract';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';

export class AbstractService<Schema, Document> {
  private model: Model<Document>;

  constructor(model: Model<Document>) {
    this.model = model;
  }

  async insertOne(
    data: Schema & Omit<SchemaBase, 'createdAt' | 'isDeleted'>,
  ): Promise<Document> {
    try {
      const inserted = await this.model.create<Schema>({
        id: uuidv4(),
        isDeleted: false,
        ...data,
      });
      return inserted.toObject();
    } catch (e) {
      throw new BadRequestException(`Error on creating table: ${e.message}`);
    }
  }

  async findOne(
    filter: Partial<Schema> & Partial<SchemaBase>,
    toObject = true,
  ): Promise<Document> {
    const data = await this.model.findOne(filter);
    if (data && toObject) {
      return data.toObject();
    }
    return data;
  }

  async isExist(
    filter: Partial<Schema> & Partial<SchemaBase>,
    isDeleted: boolean = false,
  ) {
    return this.model.exists({ ...filter, isDeleted });
  }

  async insertIfNotExist(
    keys: Array<
      | keyof Schema
      | keyof Omit<SchemaBase, 'createdAt' | 'isDeleted' | 'companyId'>
    >,
    data: Schema & Omit<SchemaBase, 'createdAt' | 'isDeleted' | 'companyId'>,
  ): Promise<{ exist: boolean; data: Document }> {
    const filter = keys.reduce((acc: Record<string, any>, key) => {
      acc[key as string] = data[key];
      return acc;
    }, {}) as Partial<Schema>;

    const exist = await this.findOne(filter);
    let newData!: Document;
    if (!exist) {
      newData = await this.insertOne(data);
    }
    return { exist: !!exist, data: newData ?? exist };
  }

  async updateOne(
    filter: Partial<Schema> & Partial<SchemaBase>,
    data: UpdateWithAggregationPipeline | UpdateQuery<Schema> | Partial<Schema>,
  ) {
    return this.model.updateOne(filter, {
      $set: data,
    } as UpdateQuery<Document>);
  }

  async upsert(
    filter: Partial<Schema> & Partial<SchemaBase>,
    data: UpdateWithAggregationPipeline | UpdateQuery<Schema> | Partial<Schema>,
  ) {
    return this.model.updateOne(
      filter,
      {
        $set: data,
      } as UpdateQuery<Document>,
      { upsert: true },
    );
  }

  async deleteOne(filter: Partial<Schema> & Partial<SchemaBase>) {
    return this.model.updateOne(filter, { isDeleted: true });
  }

  async findMany(
    filter?: Partial<Schema> & Partial<SchemaBase>,
    toObject = true,
  ) {
    const data = await this.model.find(filter);
    if (toObject) {
      return data.map((item) => item.toObject());
    } else {
      return data;
    }
  }
}
