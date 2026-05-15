import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';

@Exclude()
export class LoginResponseDto extends UserResponseDto {
  @ApiProperty({
    example: 'ejxxxxx...xxxx',
  })
  @Expose()
  token!: string;

  @ApiProperty({
    example: 1700000000,
    description: 'Token expiration time as a Unix timestamp in seconds',
  })
  @Expose()
  tokenExpiresAt?: number;
}
