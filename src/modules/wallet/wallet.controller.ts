import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Wallet } from './wallet.entity';
import { ApiTags } from '@nestjs/swagger';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletDepositWithdrawalDto } from './dto/wallet-deposit-withdrawal.dto';
import { WalletTransferDto } from './dto/wallet-transfer.dto';
import { APIResponse } from '../../shared/types.shared';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  //get all wallets
  @Get()
  async findAll(): Promise<APIResponse<Wallet[]>> {
    const wallets = await this.walletService.findAll();
    return { success: true, data: wallets, count: wallets.length };
  }

  //get all user(s) wallets
  @Get('user/:userId')
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<APIResponse<Wallet[]>> {
    const wallets = await this.walletService.findByUser([userId]);
    return { success: true, data: wallets, count: wallets.length };
  }

  //get wallet by id
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<APIResponse<Wallet>> {
    const wallet = await this.walletService.findOne(id);
    return { success: true, data: wallet };
  }

  //create wallet
  @Post()
  async create(@Body() wallet: CreateWalletDto): Promise<APIResponse<Wallet>> {
    const createdWallet = await this.walletService.create(wallet);
    return {
      success: true,
      data: createdWallet,
    };
  }

  //update wallet
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() wallet: UpdateWalletDto,
  ): Promise<APIResponse<Wallet>> {
    const updatedWallet = await this.walletService.update(id, wallet);
    return { success: true, data: updatedWallet };
  }

  // deposit to wallet
  @Post(':id/deposit')
  async deposit(
    @Param('id') id: number,
    @Body() depositDto: WalletDepositWithdrawalDto,
  ): Promise<APIResponse<Wallet>> {
    const updatedWallet = await this.walletService.deposit(
      id,
      depositDto.amount,
    );
    return { success: true, data: updatedWallet };
  }

  // withdraw from wallet
  @Post(':id/withdraw')
  async withdraw(
    @Param('id') id: number,
    @Body() withdrawalDto: WalletDepositWithdrawalDto,
  ): Promise<APIResponse<Wallet>> {
    const updatedWallet = await this.walletService.withdraw(
      id,
      withdrawalDto.amount,
    );
    return { success: true, data: updatedWallet };
  }

  // transfer to other wallet
  @Post(':id/transfer')
  async transfer(
    @Param('id') id: number,
    @Body() transferDto: WalletTransferDto,
  ): Promise<APIResponse<Wallet>> {
    const updatedWallet = await this.walletService.transfer(id, transferDto);
    return {
      success: true,
      data: updatedWallet,
      message: 'Transfer successful',
    };
  }

  //delete wallet
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<APIResponse<null>> {
    await this.walletService.delete(id);
    return { success: true, message: 'Wallet deleted successfully' };
  }
}
