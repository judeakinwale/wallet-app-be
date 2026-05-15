import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Wallet } from './wallet.entity';

const mockWallet: Wallet = {
  id: 1,
  name: 'Test Wallet',
  email: 'test@example.com',
  balance: 10000,
  userId: 1,
};

const mockWalletService = {
  findAll: jest.fn(),
  findByUser: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deposit: jest.fn(),
  withdraw: jest.fn(),
  transfer: jest.fn(),
  delete: jest.fn(),
};

describe('WalletController', () => {
  let controller: WalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WalletService, useValue: mockWalletService }],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all wallets', async () => {
      mockWalletService.findAll.mockResolvedValue([mockWallet]);
      const result = await controller.findAll();
      expect(result).toEqual({ success: true, data: [mockWallet], count: 1 });
    });
  });

  describe('findByUser', () => {
    it('should return wallets for a user', async () => {
      mockWalletService.findByUser.mockResolvedValue([mockWallet]);
      const result = await controller.findByUser(1);
      expect(result).toEqual({ success: true, data: [mockWallet], count: 1 });
      expect(mockWalletService.findByUser).toHaveBeenCalledWith([1]);
    });
  });

  describe('findOne', () => {
    it('should return a single wallet', async () => {
      mockWalletService.findOne.mockResolvedValue(mockWallet);
      const result = await controller.findOne(1);
      expect(result).toEqual({ success: true, data: mockWallet });
    });
  });

  describe('create', () => {
    it('should create and return a wallet', async () => {
      const dto = { name: 'New Wallet', email: 'new@example.com', balance: 0 };
      mockWalletService.create.mockResolvedValue({ ...dto, id: 2 });
      const result = await controller.create(dto as any);
      expect(result).toEqual({ success: true, data: { ...dto, id: 2 } });
    });
  });

  describe('update', () => {
    it('should update and return a wallet', async () => {
      const updateDto = { name: 'Updated Wallet' };
      const updatedWallet = { ...mockWallet, ...updateDto };
      mockWalletService.update.mockResolvedValue(updatedWallet);
      const result = await controller.update(1, updateDto as any);
      expect(result).toEqual({ success: true, data: updatedWallet });
    });
  });

  describe('deposit', () => {
    it('should deposit and return updated wallet', async () => {
      const depositedWallet = { ...mockWallet, balance: 11000 };
      mockWalletService.deposit.mockResolvedValue(depositedWallet);
      const result = await controller.deposit(1, { amount: 1000 });
      expect(result).toEqual({ success: true, data: depositedWallet });
      expect(mockWalletService.deposit).toHaveBeenCalledWith(1, 1000);
    });
  });

  describe('withdraw', () => {
    it('should withdraw and return updated wallet', async () => {
      const withdrawnWallet = { ...mockWallet, balance: 9000 };
      mockWalletService.withdraw.mockResolvedValue(withdrawnWallet);
      const result = await controller.withdraw(1, { amount: 1000 });
      expect(result).toEqual({ success: true, data: withdrawnWallet });
      expect(mockWalletService.withdraw).toHaveBeenCalledWith(1, 1000);
    });
  });

  describe('transfer', () => {
    it('should transfer and return updated wallet', async () => {
      const transferredWallet = { ...mockWallet, balance: 9000 };
      const transferDto = { recipientWalletId: 2, amount: 1000 };
      mockWalletService.transfer.mockResolvedValue(transferredWallet);
      const result = await controller.transfer(1, transferDto);
      expect(result).toEqual({
        success: true,
        data: transferredWallet,
        message: 'Transfer successful',
      });
      expect(mockWalletService.transfer).toHaveBeenCalledWith(1, transferDto);
    });
  });

  describe('delete', () => {
    it('should delete a wallet and return success', async () => {
      mockWalletService.delete.mockResolvedValue(undefined);
      const result = await controller.delete(1);
      expect(result).toEqual({
        success: true,
        message: 'Wallet deleted successfully',
      });
      expect(mockWalletService.delete).toHaveBeenCalledWith(1);
    });
  });
});
