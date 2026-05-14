import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  // BeforeInsert,
} from 'typeorm';
import { Wallet } from '../wallet/wallet.entity';
// import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column('simple-array', { default: 'user' })
  roles?: string[];

  @OneToMany(() => Wallet, (wallet: Wallet) => wallet.user)
  wallets?: Wallet[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  // ? handled in user service
  // @BeforeInsert()
  // async hashPassword() {
  //   this.password = await bcrypt.hash(this.password, 10);
  // }
}
