import { TransactionType, transactionTypeOptions } from '../transaction.types';
import { IsJSON, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    example: 1000,
    description: 'Transaction amount in kobo',
  })
  @IsNumber()
  amount!: number;

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'ID of the wallet initiating the transaction',
    required: false,
  })
  fromWalletId?: number;

  @ApiProperty({
    example: 2,
    description: 'ID of the wallet receiving the transaction',
    required: false,
  })
  @IsNumber()
  toWalletId?: number;

  @ApiProperty({
    example: 'transfer',
    description: 'Transaction type',
    enum: transactionTypeOptions,
  })
  @IsString()
  @IsNotEmpty()
  type!: TransactionType;

  @ApiProperty({
    example: { ref: 'xxxxx-xxxxxxx-xxxxx' },
    description: 'Other transaction details',
  })
  @IsJSON()
  details?: Record<string, any>;
}
