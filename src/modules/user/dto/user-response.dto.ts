import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Wallet } from 'src/modules/wallet/wallet.entity';

@Exclude()
export class UserResponseDto {
  @ApiProperty({
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'John Doe',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: 'john@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    example: '2026-05-13T12:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2026-05-13T12:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  @Expose()
  wallets?: Wallet[];
}
