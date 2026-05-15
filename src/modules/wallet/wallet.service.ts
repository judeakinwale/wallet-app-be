import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from './wallet.entity';
import { WalletTransferDto } from './dto/wallet-transfer.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { TransactionService } from '../transaction/transaction.service';
import { CreateTransactionDto } from '../transaction/dto/create-transaction.dto';
import { transactionTypeOptions } from '../transaction/transaction.types';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private readonly dataSource: DataSource,
    private transactionService: TransactionService,
  ) {}

  async findAll(): Promise<Wallet[]> {
    return this.walletRepository.find();
  }

  async findOne(id: number): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id },
      relations: ['user', 'sentTransactions', 'receivedTransactions'],
    });
    if (!wallet) {
      throw new NotFoundException('Wallet does not exist!');
    }
    return wallet;
  }

  async create(wallet: CreateWalletDto): Promise<Wallet> {
    const created = this.walletRepository.create(wallet);
    return this.walletRepository.save(created);
  }

  async update(id: number, wallet: UpdateWalletDto): Promise<Wallet> {
    // await this.walletRepository.update(id, wallet);
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException('Wallet does not exist!');
    }

    Object.assign(existing, wallet);

    const updated = await this.walletRepository.save(existing);
    return updated;
  }

  async withdraw(id: number, amount: number): Promise<Wallet> {
    const wallet = await this.findOne(id);
    if (!wallet) {
      throw new NotFoundException('Wallet does not exist!');
    }
    if ((wallet.balance || 0) < amount) {
      throw new NotFoundException('Insufficient balance!');
    }
    wallet.balance = (wallet.balance || 0) - amount;
    const updated = await this.walletRepository.save(wallet);

    // create transaction reference
    const transactionPayload: CreateTransactionDto = {
      type: transactionTypeOptions.withdrawal,
      amount,
      toWalletId: wallet.id,
    };
    await this.transactionService.create(transactionPayload);

    return updated;
  }

  async deposit(id: number, amount: number): Promise<Wallet> {
    const wallet = await this.findOne(id);
    if (!wallet) {
      throw new NotFoundException('Wallet does not exist!');
    }
    wallet.balance = (wallet.balance || 0) + amount;
    const updated = await this.walletRepository.save(wallet);

    // create transaction reference
    const transactionPayload: CreateTransactionDto = {
      type: transactionTypeOptions.deposit,
      amount,
      toWalletId: wallet.id,
    };
    await this.transactionService.create(transactionPayload);

    return updated;
  }

  async transfer(id: number, transfer: WalletTransferDto): Promise<Wallet> {
    const { recipientWalletId, amount } = transfer;

    return this.dataSource.transaction(async (manager) => {
      // Use the manager inside the transaction
      const wallet = await manager.findOne(Wallet, { where: { id } });
      if (!wallet) {
        throw new NotFoundException('Wallet does not exist!');
      }

      const recipientWallet = await manager.findOne(Wallet, {
        where: { id: recipientWalletId },
      });
      if (!recipientWallet) {
        throw new NotFoundException('Recipient wallet does not exist!');
      }

      if ((wallet.balance || 0) < amount) {
        throw new NotFoundException('Insufficient balance!');
      }

      // Update balances
      wallet.balance = (wallet.balance || 0) - amount;
      recipientWallet.balance = (recipientWallet.balance || 0) + amount;

      // Save both within the transaction
      await manager.save(wallet);
      await manager.save(recipientWallet);

      // create transaction reference
      const transactionPayload: CreateTransactionDto = {
        type: transactionTypeOptions.transfer,
        amount,
        fromWalletId: wallet.id,
        toWalletId: recipientWallet.id,
      };
      await this.transactionService.create(transactionPayload);

      // Return updated wallet
      return wallet;
    });
  }

  async delete(id: number): Promise<void> {
    const wallet = await this.findOne(id);
    if (!wallet) {
      throw new NotFoundException('Wallet does not exist!');
    }
    await this.walletRepository.delete(id);
  }
}
