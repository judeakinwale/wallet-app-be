import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class WalletTransferDto {
  @ApiProperty({
    example: 10000,
    description: 'Amount to transfer',
  })
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({
    example: 2,
    description: 'ID of the recipient wallet',
  })
  @IsNumber()
  @IsNotEmpty()
  recipientWalletId!: number;
}
