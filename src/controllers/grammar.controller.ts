import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { UserProfileModel } from 'src/services/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { GrammarService } from 'src/services/courses/language/grammar.service';
@UseGuards(JwtAuthGuard)
@Controller('v1/grammar')
export class GrammarController {
  constructor(private readonly service: GrammarService) {}

  @Get('/list')
  async list(@User() user: UserProfileModel) {
    return this.service.listGrammars(user);
  }

  @Get('/definition/:grammarId')
  async get(
    @User() user: UserProfileModel,
    @Param('grammarId') grammarId: string,
  ) {
    return this.service.getGrammar(user, grammarId);
  }

  @Get('/examples/:grammarId')
  async getExamples(
    @User() user: UserProfileModel,
    @Param('grammarId') grammarId: string,
  ) {
    return this.service.getExamples(user, grammarId);
  }
}
