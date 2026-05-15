import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Transaction[]> {
    return this.transactionRepository.find();
  }

  async findByWallet(walletIds: number[]): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: [{ fromWalletId: In(walletIds) }, { toWalletId: In(walletIds) }],
      relations: ['fromWallet', 'toWallet'],
    });
  }

  async findByUser(userId: number): Promise<Transaction[]> {
    // return this.transactionRepository.find({ where: { userId } });
    return this.transactionRepository
      .createQueryBuilder('t')
      .innerJoin(
        'wallet',
        'w',
        '(w.id = t.from_wallet_id OR w.id = t.to_wallet_id) AND w.user_id = :userId',
        { userId },
      )
      .getMany();
  }

  async findOne(id: number): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction does not exist!');
    }
    return transaction;
  }

  async create(transaction: CreateTransactionDto): Promise<Transaction> {
    const created = this.transactionRepository.create(transaction);
    return this.transactionRepository.save(created);
  }

  async update(
    id: number,
    transaction: UpdateTransactionDto,
  ): Promise<Transaction> {
    // await this.transactionRepository.update(id, transaction);
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException('Transaction does not exist!');
    }

    Object.assign(existing, transaction);

    const updated = await this.transactionRepository.save(existing);
    return updated;
  }

  // async delete(id: number): Promise<void> {
  //   const transaction = await this.findOne(id);
  //   if (!transaction) {
  //     throw new NotFoundException('Transaction does not exist!');
  //   }
  //   await this.transactionRepository.delete(id);
  // }
}
