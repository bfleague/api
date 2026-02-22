import { ApiProperty } from '@nestjs/swagger';

export class ConfirmUserResponseDto {
  @ApiProperty()
  isCorrect: boolean;

  @ApiProperty({ type: String, nullable: true })
  discordId: string | null;

  constructor(result: { isCorrect: boolean; discordId: string | null }) {
    this.isCorrect = result.isCorrect;
    this.discordId = result.discordId;
  }
}
