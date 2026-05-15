import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Wallet } from './wallet.entity';
import { TransactionService } from '../transaction/transaction.service';
import { Transaction } from '../transaction/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction])],
  controllers: [WalletController],
  providers: [WalletService, TransactionService],
})
export class WalletModule {}
