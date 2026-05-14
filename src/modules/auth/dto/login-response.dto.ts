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
}
