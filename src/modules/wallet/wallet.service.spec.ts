import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Wallet } from './wallet.entity';
import { TransactionService } from '../transaction/transaction.service';
import { transactionTypeOptions } from '../transaction/transaction.types';

const mockWallet: Wallet = {
  id: 1,
  name: 'Test Wallet',
  email: 'test@example.com',
  balance: 10000,
  userId: 1,
};

const mockWalletRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockTransactionService = {
  create: jest.fn(),
};

const mockManager = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn((cb) => cb(mockManager)),
};

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all wallets', async () => {
      mockWalletRepository.find.mockResolvedValue([mockWallet]);
      const result = await service.findAll();
      expect(result).toEqual([mockWallet]);
      expect(mockWalletRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByUser', () => {
    it('should return wallets for given user ids', async () => {
      mockWalletRepository.find.mockResolvedValue([mockWallet]);
      const result = await service.findByUser([1]);
      expect(result).toEqual([mockWallet]);
      expect(mockWalletRepository.find).toHaveBeenCalledWith({
        where: { userId: expect.anything() },
      });
    });
  });

  describe('findOne', () => {
    it('should return a wallet by id', async () => {
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      const result = await service.findOne(1);
      expect(result).toEqual(mockWallet);
      expect(mockWalletRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user', 'sentTransactions', 'receivedTransactions'],
      });
    });

    it('should throw NotFoundException when wallet does not exist', async () => {
      mockWalletRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a wallet', async () => {
      const dto = { name: 'New Wallet', email: 'new@example.com', balance: 0 };
      mockWalletRepository.create.mockReturnValue(dto);
      mockWalletRepository.save.mockResolvedValue({ ...dto, id: 2 });
      const result = await service.create(dto);
      expect(result).toEqual({ ...dto, id: 2 });
      expect(mockWalletRepository.create).toHaveBeenCalledWith(dto);
      expect(mockWalletRepository.save).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update and return a wallet', async () => {
      const updateDto = { name: 'Updated Wallet' };
      const updatedWallet = { ...mockWallet, ...updateDto };
      mockWalletRepository.findOne.mockResolvedValue({ ...mockWallet });
      mockWalletRepository.save.mockResolvedValue(updatedWallet);
      const result = await service.update(1, updateDto);
      expect(result).toEqual(updatedWallet);
    });

    it('should throw NotFoundException when wallet does not exist', async () => {
      mockWalletRepository.findOne.mockResolvedValue(null);
      await expect(service.update(99, { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deposit', () => {
    it('should add amount to wallet balance and record transaction', async () => {
      const wallet = { ...mockWallet, balance: 5000 };
      mockWalletRepository.findOne.mockResolvedValue(wallet);
      mockWalletRepository.save.mockResolvedValue({
        ...wallet,
        balance: 6000,
      });
      mockTransactionService.create.mockResolvedValue({});

      const result = await service.deposit(1, 1000);

      expect(result.balance).toBe(6000);
      expect(mockTransactionService.create).toHaveBeenCalledWith({
        type: transactionTypeOptions.deposit,
        amount: 1000,
        toWalletId: wallet.id,
      });
    });

    it('should throw NotFoundException when wallet does not exist', async () => {
      mockWalletRepository.findOne.mockResolvedValue(null);
      await expect(service.deposit(99, 1000)).rejects.toThrow(NotFoundException);
    });
  });

  describe('withdraw', () => {
    it('should subtract amount from wallet balance and record transaction', async () => {
      const wallet = { ...mockWallet, balance: 5000 };
      mockWalletRepository.findOne.mockResolvedValue(wallet);
      mockWalletRepository.save.mockResolvedValue({
        ...wallet,
        balance: 4000,
      });
      mockTransactionService.create.mockResolvedValue({});

      const result = await service.withdraw(1, 1000);

      expect(result.balance).toBe(4000);
      expect(mockTransactionService.create).toHaveBeenCalledWith({
        type: transactionTypeOptions.withdrawal,
        amount: 1000,
        toWalletId: wallet.id,
      });
    });

    it('should throw NotFoundException when balance is insufficient', async () => {
      mockWalletRepository.findOne.mockResolvedValue({
        ...mockWallet,
        balance: 500,
      });
      await expect(service.withdraw(1, 1000)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when wallet does not exist', async () => {
      mockWalletRepository.findOne.mockResolvedValue(null);
      await expect(service.withdraw(99, 1000)).rejects.toThrow(NotFoundException);
    });
  });

  describe('transfer', () => {
    it('should transfer amount between wallets and record transaction', async () => {
      const senderWallet = { id: 1, balance: 5000 };
      const recipientWallet = { id: 2, balance: 2000 };
      mockManager.findOne
        .mockResolvedValueOnce(senderWallet)
        .mockResolvedValueOnce(recipientWallet);
      mockManager.save.mockResolvedValue({});
      mockTransactionService.create.mockResolvedValue({});

      const result = await service.transfer(1, {
        recipientWalletId: 2,
        amount: 1000,
      });

      expect(senderWallet.balance).toBe(4000);
      expect(recipientWallet.balance).toBe(3000);
      expect(result).toEqual(senderWallet);
      expect(mockTransactionService.create).toHaveBeenCalledWith({
        type: transactionTypeOptions.transfer,
        amount: 1000,
        fromWalletId: 1,
        toWalletId: 2,
      });
    });

    it('should throw NotFoundException when sender wallet does not exist', async () => {
      mockManager.findOne.mockResolvedValueOnce(null);
      await expect(
        service.transfer(99, { recipientWalletId: 2, amount: 1000 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when recipient wallet does not exist', async () => {
      mockManager.findOne
        .mockResolvedValueOnce({ id: 1, balance: 5000 })
        .mockResolvedValueOnce(null);
      await expect(
        service.transfer(1, { recipientWalletId: 99, amount: 1000 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when sender balance is insufficient', async () => {
      mockManager.findOne
        .mockResolvedValueOnce({ id: 1, balance: 500 })
        .mockResolvedValueOnce({ id: 2, balance: 2000 });
      await expect(
        service.transfer(1, { recipientWalletId: 2, amount: 1000 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a wallet', async () => {
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockWalletRepository.delete.mockResolvedValue({ affected: 1 });
      await service.delete(1);
      expect(mockWalletRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when wallet does not exist', async () => {
      mockWalletRepository.findOne.mockResolvedValue(null);
      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });
});
