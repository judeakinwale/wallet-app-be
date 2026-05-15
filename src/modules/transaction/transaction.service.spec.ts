import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Transaction } from './transaction.entity';
import { transactionTypeOptions } from './transaction.types';

const mockTransaction: Transaction = {
  id: 1,
  amount: 5000,
  type: transactionTypeOptions.deposit,
  toWalletId: 1,
};

const mockQueryBuilder = {
  innerJoin: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};

const mockTransactionRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

const mockDataSource = {};

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    jest.clearAllMocks();
    mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all transactions', async () => {
      mockTransactionRepository.find.mockResolvedValue([mockTransaction]);
      const result = await service.findAll();
      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('findByWallet', () => {
    it('should return transactions for given wallet ids', async () => {
      mockTransactionRepository.find.mockResolvedValue([mockTransaction]);
      const result = await service.findByWallet([1]);
      expect(result).toEqual([mockTransaction]);
      expect(mockTransactionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ relations: ['fromWallet', 'toWallet'] }),
      );
    });
  });

  describe('findByUser', () => {
    it('should return transactions for a user', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockTransaction]);
      const result = await service.findByUser(1);
      expect(result).toEqual([mockTransaction]);
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      const result = await service.findOne(1);
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a transaction', async () => {
      const dto = { amount: 3000, type: transactionTypeOptions.deposit, toWalletId: 1 };
      mockTransactionRepository.create.mockReturnValue(dto);
      mockTransactionRepository.save.mockResolvedValue({ ...dto, id: 2 });
      const result = await service.create(dto);
      expect(result).toEqual({ ...dto, id: 2 });
    });
  });

  describe('update', () => {
    it('should update and return a transaction', async () => {
      const updateDto = { amount: 7000 };
      const updated = { ...mockTransaction, ...updateDto };
      mockTransactionRepository.findOne.mockResolvedValue({ ...mockTransaction });
      mockTransactionRepository.save.mockResolvedValue(updated);
      const result = await service.update(1, updateDto as any);
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);
      await expect(service.update(99, { amount: 100 } as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
