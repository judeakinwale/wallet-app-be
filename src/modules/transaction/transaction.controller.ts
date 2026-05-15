import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Transaction } from './transaction.entity';
import { ApiTags } from '@nestjs/swagger';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { APIResponse } from '../../shared/types.shared';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@ApiTags('transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  //get all transactions
  @Get()
  async findAll(): Promise<APIResponse<Transaction[]>> {
    const transactions = await this.transactionService.findAll();
    return { success: true, data: transactions, count: transactions.length };
  }

  //get all wallet transactions
  @Get('wallet/:walletIds')
  async findAllByWallet(
    @Param('walletIds') walletIds: string, // comma separated wallet ids
  ): Promise<APIResponse<Transaction[]>> {
    const walletIdArray = walletIds.split(',').map((id) => parseInt(id));
    const transactions =
      await this.transactionService.findByWallet(walletIdArray);
    return { success: true, data: transactions, count: transactions.length };
  }

  //get all user transactions
  @Get('user/:userId')
  async findAllByUser(
    @Param('userId') userId: number,
  ): Promise<APIResponse<Transaction[]>> {
    const transactions = await this.transactionService.findByUser(userId);
    return { success: true, data: transactions, count: transactions.length };
  }

  //get transaction by id
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<APIResponse<Transaction>> {
    const transaction = await this.transactionService.findOne(id);
    return { success: true, data: transaction };
  }

  //create transaction
  @Post()
  async create(
    @Body() transaction: CreateTransactionDto,
  ): Promise<APIResponse<Transaction>> {
    const createdTransaction =
      await this.transactionService.create(transaction);
    return {
      success: true,
      data: createdTransaction,
    };
  }

  //update transaction
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() transaction: UpdateTransactionDto,
  ): Promise<APIResponse<Transaction>> {
    const updatedTransaction = await this.transactionService.update(
      id,
      transaction,
    );
    return { success: true, data: updatedTransaction };
  }

  // //delete transaction
  // @Delete(':id')
  // async delete(@Param('id') id: number): Promise<APIResponse<null>> {
  //   await this.transactionService.delete(id);
  //   return { success: true, message: 'Transaction deleted successfully' };
  // }
}
