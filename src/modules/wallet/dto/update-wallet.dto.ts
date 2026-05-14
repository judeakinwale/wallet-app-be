import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateWalletDto {
  @ApiProperty({
    example: 'Test Wallet',
    description: 'Wallet name',
  })
  @IsString()
  @IsNotEmpty()
  name?: string;
}
