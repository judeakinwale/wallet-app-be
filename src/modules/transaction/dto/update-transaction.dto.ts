import { IsJSON } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTransactionDto {
  @ApiProperty({
    example: { ref: 'xxxxx-xxxxxxx-xxxxx' },
    description: 'Other transaction details',
  })
  @IsJSON()
  details?: Record<string, any>;
}
