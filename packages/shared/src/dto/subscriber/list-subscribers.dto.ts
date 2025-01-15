import { ISubscriber } from '../../entities/subscriber';
import { DirectionEnum } from '../../types/response';
import { ISubscriberGetListQueryParams } from './subscriber.dto';

export interface IListSubscribersRequestDto extends ISubscriberGetListQueryParams {
  limit: number;

  cursor?: string;

  orderDirection: DirectionEnum;

  orderBy: 'updatedAt' | 'createdAt' | 'lastOnlineAt';

  query?: string;

  email?: string;

  phone?: string;

  subscriberId?: string;

  name?: string;
}

export interface IListSubscribersResponseDto {
  subscribers: ISubscriber[];

  hasMore: boolean;

  pageSize: number;

  nextCursor?: string;
}
