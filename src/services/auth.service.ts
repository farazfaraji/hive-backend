import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AbstractService } from 'src/abstracts/service.abstract';
import { User, UserDocument } from 'src/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/repositories/user.repository';
import { LoginDto } from 'src/dtos/auth/login.dto';
import { UserSignupDto } from 'src/dtos/auth/signup.dto';
import { Schema as MongooseSchema } from 'mongoose';
import { Language } from 'src/schemas/word.schema';

export type UserProfileModel = {
  userId: string;
  _id: MongooseSchema.Types.ObjectId;
  firstname: string;
  lastname: string;
  email: string;
  level: number;
  targetLanguage: Language;
  interests: string[];
  language: Language;
  exam?: string;
};

@Injectable()
export class AuthService extends AbstractService<User, UserDocument> {
  constructor(
    private readonly repository: UserRepository,
    private readonly jwtService: JwtService,
  ) {
    super(repository.getTarget());
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.repository.findUserByEmail({
        email: loginDto.email,
      });

      if (!user) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const payload = {
        sub: user._id,
        userId: user.uniqueId,
        email: user.email,
      };

      const token = await this.jwtService.signAsync(payload);

      return {
        token,
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async signup(signupDto: UserSignupDto): Promise<void> {
    const userFromDatabase = await this.repository.findUserByEmail({
      email: signupDto.email,
    });

    if (userFromDatabase) {
      throw new HttpException('Email already exists.', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    await this.insertIfNotExist(['email'], {
      ...signupDto,
      uniqueId: uuidv4(),
      password: hashedPassword,
      isDeleted: false,
      level: 0,
      interests: [],
    });
  }

  async getUser(id: string): Promise<UserProfileModel> {
    const user = await this.findOne({ uniqueId: id });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return {
      userId: user.uniqueId,
      _id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      level: user.level,
      targetLanguage: user.targetLanguage,
      interests: user.interests,
      language: user.language,
      exam: user.exam,
    };
  }
}
