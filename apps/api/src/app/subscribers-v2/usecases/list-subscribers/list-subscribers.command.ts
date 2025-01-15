import { DirectionEnum } from '@novu/shared';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { CursorPaginatedCommand } from '@novu/application-generic';

export class ListSubscribersCommand extends CursorPaginatedCommand {
  @IsEnum(DirectionEnum)
  @IsOptional()
  orderDirection: DirectionEnum = DirectionEnum.DESC;

  @IsEnum(['updatedAt', 'createdAt', 'lastOnlineAt'])
  @IsOptional()
  orderBy: 'updatedAt' | 'createdAt' | 'lastOnlineAt' = 'createdAt';

  @IsString()
  @IsOptional()
  query?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  subscriberId?: string;

  @IsString()
  @IsOptional()
  name?: string;
}
