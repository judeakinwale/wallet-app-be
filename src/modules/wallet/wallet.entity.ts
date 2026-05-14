import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Transaction } from '../transaction/transaction.entity';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name!: string;

  @Column()
  email!: string; // related user's email

  @Column({ default: 0 })
  balance!: number; // in kobo

  @Column({ nullable: true })
  userId?: number;

  @ManyToOne(() => User, (user) => user.wallets)
  @JoinColumn({ name: 'userId' })
  user?: User;

  @OneToMany(() => Transaction, (transaction) => transaction.fromWallet)
  sentTransactions?: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.toWallet)
  receivedTransactions?: Transaction[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
