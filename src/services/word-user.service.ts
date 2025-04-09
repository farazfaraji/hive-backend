import { Injectable } from '@nestjs/common';
import { WordUserRepository } from 'src/repositories/word-user.repository';
import {
  WordUserDto,
  WordUser,
  WordUserDocument,
} from 'src/schemas/word-user.schema';
import { UserProfileModel } from './auth.service';
import { AbstractService } from 'src/abstracts/service.abstract';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WordUserService extends AbstractService<
  WordUser,
  WordUserDocument
> {
  constructor(private readonly repository: WordUserRepository) {
    super(repository.getTarget());
  }

  async create(
    user: UserProfileModel,
    word: WordUserDto,
  ): Promise<WordUserDocument> {
    const data = await this.insertIfNotExist(['wordId', 'userId'], {
      ...word,
      uniqueId: word.uniqueId,
      userId: user._id,
      language: user.language,
      isLearned: false,
      isFavorite: false,
      lastTry: new Date(),
      nextTry: new Date(),
      numberOfTry: 0,
    });

    return data.data;
  }

  async getCandidate(user: UserProfileModel): Promise<WordUserDocument | null> {
    const currentDate = new Date();

    const result = await this.repository.getTarget().aggregate([
      {
        $match: {
          userId: user._id,
          language: user.language,
          nextTry: { $lte: currentDate },
          isDeleted: false,
          isLearned: false,
        },
      },
      { $sample: { size: 1 } },
    ]);

    return result[0] || null;
  }

  async acknowledge(user: UserProfileModel, wordId: string) {
    const wordUser = await this.findOne({ uniqueId: wordId, userId: user._id });
    if (!wordUser) {
      throw new Error('Word not found');
    }

    const numberOfTry = wordUser.numberOfTry + 1;
    const nextTry = this.calculateNextTry(numberOfTry);
    const isLearned = numberOfTry >= 20;

    await this.updateOne(
      { uniqueId: wordUser.uniqueId },
      {
        nextTry,
        numberOfTry,
        isLearned,
      },
    );
  }

  private calculateNextTry(numberOfTry: number): Date {
    const nextTry = new Date();

    if (numberOfTry >= 20) {
      nextTry.setDate(nextTry.getDate() + 14); // Every two weeks
      return nextTry;
    }

    switch (numberOfTry) {
      case 1:
        nextTry.setHours(nextTry.getHours() + 5);
        break;
      case 2:
        nextTry.setDate(nextTry.getDate() + 1);
        break;
      case 3:
        nextTry.setDate(nextTry.getDate() + 2);
        break;
      case 4:
        nextTry.setDate(nextTry.getDate() + 3);
        break;
      case 5:
        nextTry.setDate(nextTry.getDate() + 5);
        break;
      case 6:
        nextTry.setDate(nextTry.getDate() + 7);
        break;
      case 7:
        nextTry.setDate(nextTry.getDate() + 10);
        break;
      case 8:
        nextTry.setDate(nextTry.getDate() + 14);
        break;
      case 9:
        nextTry.setDate(nextTry.getDate() + 21);
        break;
      case 10:
        nextTry.setDate(nextTry.getDate() + 30);
        break;
      default:
        nextTry.setDate(nextTry.getDate() + 14); // Every two weeks for tries > 10
    }

    return nextTry;
  }

  async tryLater(user: UserProfileModel, wordId: string, nextTry: Date) {
    const wordUser = await this.findOne({ uniqueId: wordId, userId: user._id });
    if (!wordUser) {
      throw new Error('Word not found');
    }

    await this.updateOne(
      { uniqueId: wordUser.uniqueId },
      {
        nextTry,
        lastTry: new Date(),
      },
    );
  }
}
