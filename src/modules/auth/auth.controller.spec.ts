import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { ReqWithUser } from 'src/shared/types.shared';

const mockUser: UserResponseDto = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date('2026-01-01'),
};

const mockLoginResponse: LoginResponseDto = {
  ...mockUser,
  token: 'mock.jwt.token',
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return an API response', async () => {
      const dto: RegisterDto = { name: 'John Doe', email: 'john@example.com', password: 'password123' };
      authService.register.mockResolvedValue(mockLoginResponse);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLoginResponse);
      expect(result.message).toBe('Registration successful');
    });
  });

  describe('login', () => {
    it('should call authService.login and return an API response', async () => {
      const dto: LoginDto = { email: 'john@example.com', password: 'password123' };
      authService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLoginResponse);
      expect(result.message).toBe('Login successful');
    });
  });

  describe('getMe', () => {
    it('should return the current user wrapped in an API response', async () => {
      const req = { user: { id: 1, email: 'john@example.com' } } as ReqWithUser;
      userService.findOne.mockResolvedValue(mockUser);

      const result = await controller.getMe(req);

      expect(userService.findOne).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
    });
  });
});
