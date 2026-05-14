import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { User } from './user.entity';
import { WalletService } from '../wallet/wallet.service';
import { Wallet } from '../wallet/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Wallet])],
  controllers: [UserController],
  providers: [UserService, WalletService],
})
export class UserModule {}
