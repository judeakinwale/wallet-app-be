import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { Transaction } from './transaction.entity';
import { transactionTypeOptions } from './transaction.types';

const mockTransaction: Transaction = {
  id: 1,
  amount: 5000,
  type: transactionTypeOptions.deposit,
  toWalletId: 1,
};

const mockTransactionService = {
  findAll: jest.fn(),
  findByWallet: jest.fn(),
  findByUser: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

describe('TransactionController', () => {
  let controller: TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        { provide: TransactionService, useValue: mockTransactionService },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all transactions', async () => {
      mockTransactionService.findAll.mockResolvedValue([mockTransaction]);
      const result = await controller.findAll();
      expect(result).toEqual({
        success: true,
        data: [mockTransaction],
        count: 1,
      });
    });
  });

  describe('findAllByWallet', () => {
    it('should parse comma-separated wallet ids and return transactions', async () => {
      mockTransactionService.findByWallet.mockResolvedValue([mockTransaction]);
      const result = await controller.findAllByWallet('1,2');
      expect(result).toEqual({
        success: true,
        data: [mockTransaction],
        count: 1,
      });
      expect(mockTransactionService.findByWallet).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('findAllByUser', () => {
    it('should return transactions for a user', async () => {
      mockTransactionService.findByUser.mockResolvedValue([mockTransaction]);
      const result = await controller.findAllByUser(1);
      expect(result).toEqual({
        success: true,
        data: [mockTransaction],
        count: 1,
      });
      expect(mockTransactionService.findByUser).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    it('should return a single transaction', async () => {
      mockTransactionService.findOne.mockResolvedValue(mockTransaction);
      const result = await controller.findOne(1);
      expect(result).toEqual({ success: true, data: mockTransaction });
    });
  });

  describe('create', () => {
    it('should create and return a transaction', async () => {
      const dto = { amount: 3000, type: transactionTypeOptions.deposit, toWalletId: 1 };
      mockTransactionService.create.mockResolvedValue({ ...dto, id: 2 });
      const result = await controller.create(dto as any);
      expect(result).toEqual({ success: true, data: { ...dto, id: 2 } });
    });
  });

  describe('update', () => {
    it('should update and return a transaction', async () => {
      const updated = { ...mockTransaction, amount: 9000 };
      mockTransactionService.update.mockResolvedValue(updated);
      const result = await controller.update(1, { amount: 9000 } as any);
      expect(result).toEqual({ success: true, data: updated });
      expect(mockTransactionService.update).toHaveBeenCalledWith(1, { amount: 9000 });
    });
  });
});
