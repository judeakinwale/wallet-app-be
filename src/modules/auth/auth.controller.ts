import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/auth.guard';
import { APIResponse, ReqWithUser } from 'src/shared/types.shared';
import { UserService } from '../user/user.service';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('register')
  async register(
    @Body() body: RegisterDto,
  ): Promise<APIResponse<UserResponseDto>> {
    const data = await this.authService.register(body);
    return { success: true, data, message: 'Registration successful' };
  }

  @Post('login')
  async login(@Body() body: LoginDto): Promise<APIResponse<LoginResponseDto>> {
    const data = await this.authService.login(body);
    return { success: true, data, message: 'Login successful' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: ReqWithUser): Promise<APIResponse<UserResponseDto>> {
    const { user } = req;
    const data = await this.userService.findOne(user.id);
    return { success: true, data };
  }
}
