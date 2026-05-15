import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';
import { ReqWithUser } from 'src/shared/types.shared';

const mockUserResponse: UserResponseDto = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserService = {
  findAll: jest.fn(),
  search: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updatePassword: jest.fn(),
  delete: jest.fn(),
};

const mockReq = { user: { id: 1, email: 'john@example.com', roles: ['user'] } } as ReqWithUser;

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockUserService.findAll.mockResolvedValue([mockUserResponse]);
      const result = await controller.findAll();
      expect(result).toEqual({ success: true, data: [mockUserResponse] });
    });
  });

  describe('findMatching', () => {
    it('should return matching users', async () => {
      mockUserService.search.mockResolvedValue([mockUserResponse]);
      const result = await controller.findMatching('john');
      expect(result).toEqual({ success: true, data: [mockUserResponse], message: undefined });
      expect(mockUserService.search).toHaveBeenCalledWith('john');
    });

    it('should include message when no users found', async () => {
      mockUserService.search.mockResolvedValue([]);
      const result = await controller.findMatching('nobody');
      expect(result.message).toBe('No matching users found');
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      mockUserService.findOne.mockResolvedValue(mockUserResponse);
      const result = await controller.findOne(1);
      expect(result).toEqual({ success: true, data: mockUserResponse });
    });
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const dto = { name: 'Jane', email: 'jane@example.com', password: 'pass' };
      mockUserService.create.mockResolvedValue(mockUserResponse);
      const result = await controller.create(dto as any);
      expect(result).toEqual({
        success: true,
        data: mockUserResponse,
        message: 'User created successfully',
      });
    });
  });

  describe('updateSelf', () => {
    it('should update the authenticated user', async () => {
      const updated = { ...mockUserResponse, name: 'Updated' };
      mockUserService.update.mockResolvedValue(updated);
      const result = await controller.updateSelf(mockReq, { name: 'Updated' } as any);
      expect(result).toEqual({
        success: true,
        data: updated,
        message: 'User updated successfully',
      });
      expect(mockUserService.update).toHaveBeenCalledWith(1, { name: 'Updated' });
    });
  });

  describe('updatePassword', () => {
    it('should update the authenticated user password', async () => {
      mockUserService.updatePassword.mockResolvedValue(mockUserResponse);
      const result = await controller.updatePassword(mockReq, { password: 'newpass' } as any);
      expect(result).toEqual({
        success: true,
        data: mockUserResponse,
        message: 'User updated successfully',
      });
      expect(mockUserService.updatePassword).toHaveBeenCalledWith(1, 'newpass');
    });
  });

  describe('update', () => {
    it('should update a user by id', async () => {
      const updated = { ...mockUserResponse, name: 'Updated' };
      mockUserService.update.mockResolvedValue(updated);
      const result = await controller.update({ name: 'Updated' } as any, 1);
      expect(result).toEqual({
        success: true,
        data: updated,
        message: 'User updated successfully',
      });
    });
  });

  describe('delete', () => {
    it('should delete a user and return success', async () => {
      mockUserService.delete.mockResolvedValue(undefined);
      const result = await controller.delete(1);
      expect(result).toEqual({ success: true, message: 'User deleted successfully' });
      expect(mockUserService.delete).toHaveBeenCalledWith(1);
    });
  });
});
