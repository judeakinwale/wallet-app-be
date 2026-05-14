import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Wallet } from '../wallet/wallet.entity';
import { TransactionType, transactionTypeOptions } from './transaction.types';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  amount!: number;

  @Column({ nullable: true })
  fromWalletId?: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.sentTransactions)
  @JoinColumn({ name: 'fromWalletId' })
  fromWallet?: Wallet;

  @Column({ nullable: true })
  toWalletId?: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.receivedTransactions)
  @JoinColumn({ name: 'toWalletId' })
  toWallet?: Wallet;

  @Column({ default: transactionTypeOptions.transfer })
  type!: TransactionType;

  @Column({ type: 'json', nullable: true })
  details?: Record<string, any>;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
