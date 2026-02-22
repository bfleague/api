import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ConfirmationResult } from '../types/confirmation-result.type';

export class ConfirmUserResponseDto {
  @ApiProperty({ name: 'is_correct' })
  @Expose({ name: 'is_correct' })
  isCorrect: boolean;

  @ApiProperty({ name: 'discord_id', type: String, nullable: true })
  @Expose({ name: 'discord_id' })
  discordId: string | null;

  constructor(result: ConfirmationResult) {
    this.isCorrect = result.isCorrect;
    this.discordId = result.discordId;
  }
}
