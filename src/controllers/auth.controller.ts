import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from 'src/dtos/auth/login.dto';
import { UserSignupDto } from 'src/dtos/auth/signup.dto';
import { AuthService } from 'src/services/auth.service';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
    throw new UnauthorizedException();
  }

  @Post('/signup')
  async signup(@Body() signupDto: UserSignupDto) {
    try {
      await this.authService.signup(signupDto);
      return { status: true };
    } catch (e) {
      throw new HttpException(
        { status: false, message: e.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
