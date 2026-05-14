import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

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
}
