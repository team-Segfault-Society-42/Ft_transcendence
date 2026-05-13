import { ApiProperty } from '@nestjs/swagger';

export class AchievementDto {
  @ApiProperty({ example: 'FIRST_WIN' })
  key: string;

  @ApiProperty({ example: 'Frist Blood' })
  displayName: string;

  @ApiProperty({ example: 'Win your first game.' })
  description: string;

  @ApiProperty({ example: 'FIRST_WIN_TROPHY' })
  iconName: string;
}
