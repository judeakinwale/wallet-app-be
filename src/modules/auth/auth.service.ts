import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(registerDto: RegisterDto): Promise<LoginResponseDto> {
    const existing = await this.findUserByEmail(registerDto.email);
    if (existing) {
      throw new NotFoundException('This user already exists, login instead!');
    }

    const created = await this.userService.create(registerDto);
    const token = this.generateToken(created);
    const decoded = this.decodeToken(token);
    const expiresAt = decoded['exp'] as number;

    return {
      ...created,
      token,
      tokenExpiresAt: expiresAt,
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);

    const token = this.generateToken(user);
    const decoded = this.decodeToken(token);
    const expiresAt = decoded['exp'] as number;

    return {
      ...user,
      token,
      tokenExpiresAt: expiresAt,
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponseDto> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials!');
    }

    const isMatching = await bcrypt.compare(password, user.password);
    if (!isMatching) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    return plainToClass(UserResponseDto, user);
  }

  generateToken(user: UserResponseDto): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload); // expires already handled in jwt config
  }

  decodeToken(token: string): { [key: string]: any } {
    return this.jwtService.decode(token);
  }

  private async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }
}
