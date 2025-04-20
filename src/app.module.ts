import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserRepository } from './repositories/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { WordController } from './controllers/word.controller';
import { WordService } from './services/courses/language/word.service';
import { WordSchema } from './schemas/word.schema';
import { Word } from './schemas/word.schema';
import { WordRepository } from './repositories/word.repository';
import { TranslatorService } from './services/translator.service';
import { GrammarService } from './services/courses/language/grammar.service';
import { GrammarRepository } from './repositories/grammar.repository';
import { Grammar, GrammarSchema } from './schemas/grammar.schema';
import { GrammarController } from './controllers/grammar.controller';
import { LessonService } from './services/courses/language/lesson.service';
import { LessonController } from './controllers/lesson.controller';
import { Progress, ProgressSchema } from './schemas/progress.schema';
import { ProgressService } from './services/courses/language/progress.service';
import { ProgressRepository } from './repositories/progress.repository';
import { WordUserService } from './services/courses/language/word-user.service';
import { WordUser, WordUserSchema } from './schemas/word-user.schema';
import { WordUserRepository } from './repositories/word-user.repository';
import { PlanService } from './services/plan.service';
import { Plan, PlanSchema } from './schemas/plan.schema';
import { PlanRepository } from './repositories/plan.repository';
import { PlanController } from './controllers/plan.controller';
import { CourseService } from './services/courses/course.service';
import {
  LanguageCource,
  LanguageCourceSchema,
} from './schemas/language/language-course.schema';
import { CoursesController } from './controllers/courses.controller';
import { UserService } from './services/user.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`${process.env.NODE_ENV || ''}.env`],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        authSource: 'admin',
        retryWrites: true,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Word.name, schema: WordSchema },
      { name: Grammar.name, schema: GrammarSchema },
      { name: Progress.name, schema: ProgressSchema },
      { name: WordUser.name, schema: WordUserSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: LanguageCource.name, schema: LanguageCourceSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    WordController,
    LessonController,
    GrammarController,
    PlanController,
    CoursesController,
  ],
  providers: [
    AppService,
    AuthService,
    JwtStrategy,
    PlanService,
    WordService,
    LessonService,
    ProgressService,
    GrammarService,
    TranslatorService,
    UserService,
    CourseService,
    WordUserService,
    WordRepository,
    WordUserRepository,
    UserRepository,
    GrammarRepository,
    ProgressRepository,
    PlanRepository,
  ],
})
export class AppModule {}
