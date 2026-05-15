import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { WalletService } from '../wallet/wallet.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
}));
import * as bcrypt from 'bcrypt';

const mockUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashedpassword',
  roles: ['user'],
};

const mockUserRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockWalletService = {
  create: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: WalletService, useValue: mockWalletService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users as UserResponseDto', async () => {
      mockUserRepository.find.mockResolvedValue([mockUser]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe(mockUser.email);
      expect((result[0] as any).password).toBeUndefined();
    });
  });

  describe('search', () => {
    it('should throw BadRequestException when no query is provided', async () => {
      await expect(service.search('')).rejects.toThrow(BadRequestException);
    });

    it('should return matching users', async () => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockUser]),
      };
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQb);
      const result = await service.search('john');
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe(mockUser.email);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findOne(1);
      expect(result.email).toBe(mockUser.email);
      expect((result as any).password).toBeUndefined();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should hash password, create user, and create default wallet', async () => {
      const dto = {
        name: 'Jane',
        email: 'jane@example.com',
        password: 'plaintext',
      };
      const savedUser = { ...dto, id: 2, password: 'hashed' };
      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);
      mockWalletService.create.mockResolvedValue({});

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      const result = await service.create(dto as any);
      expect(result.email).toBe(dto.email);
      expect(mockWalletService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: dto.email, userId: 2 }),
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findByEmail('john@example.com');
      expect(result?.email).toBe(mockUser.email);
    });

    it('should throw NotFoundException when email not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.findByEmail('missing@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      const updated = { ...mockUser, name: 'Updated Name' };
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockResolvedValue(updated);
      const result = await service.update(1, { name: 'Updated Name' });
      expect(result?.name).toBe('Updated Name');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.update(99, { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePassword', () => {
    it('should hash new password and save user', async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashed');

      const result = await service.updatePassword(1, 'newpassword');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.updatePassword(99, 'pass')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });
      await service.delete(1);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });
});
