import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { WordService } from 'src/services/word.service';
import { User } from 'src/decorators/user.decorator';
import { UserProfileModel } from 'src/services/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { NewWordDto } from 'src/dtos/word/new-word.dto';

export type getTranslationResponse = {
  uniqueId: string;
  word: string;
  example: string;
  meaning: string;
  translation: string;
  synonyms: string[];
  contexts: string[];
};

@UseGuards(JwtAuthGuard)
@Controller('v1/word')
export class WordController {
  constructor(private readonly service: WordService) {}

  @Post('/')
  async create(@User() user: UserProfileModel, @Body() wordDto: NewWordDto) {
    return this.service.createWord(user, wordDto);
  }

  @Get('/translation/:wordId')
  async getTranslation(
    @User() user: UserProfileModel,
    @Param('wordId') wordId: string,
  ): Promise<getTranslationResponse> {
    return this.service.getTranslation(user, wordId);
  }

  @Get('/candidate')
  async getCandidateWord(@User() user: UserProfileModel) {
    return this.service.getCandidateWord(user);
  }

  @Post('/acknowledge/:wordId')
  async acknowledgeWord(
    @User() user: UserProfileModel,
    @Param('wordId') wordId: string,
  ) {
    return this.service.acknowledgeWord(user, wordId);
  }

  @Post('/:wordId/try-later')
  async tryLaterWord(
    @User() user: UserProfileModel,
    @Param('wordId') wordId: string,
  ) {
    return this.service.tryLaterWord(user, wordId);
  }
}
