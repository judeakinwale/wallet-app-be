import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class WalletDepositWithdrawalDto {
  @ApiProperty({
    example: 10000,
    description: 'Amount to deposit / withdraw',
  })
  @IsNumber()
  @IsNotEmpty()
  amount!: number;
}
