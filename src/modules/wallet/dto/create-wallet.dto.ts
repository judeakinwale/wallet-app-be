import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({
    example: 'Test Wallet',
    description: 'Wallet name',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'john.doe@email.com',
    description: 'Email of the wallet owner',
  })
  @IsEmail()
  email!: string; // related user's email

  @ApiProperty({
    example: 0,
    description: 'Initial balance of the wallet in kobo',
  })
  @IsNumber()
  balance!: number; // in kobo

  @ApiProperty({
    example: 1,
    description: 'ID of the wallet owner',
    required: false,
  })
  @IsNumber()
  userId!: number;
}
