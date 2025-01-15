import { ClassSerializerInterceptor, Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserAuthGuard, UserSession } from '@novu/application-generic';
import { DirectionEnum, IListSubscribersRequestDto, IListSubscribersResponseDto, UserSessionData } from '@novu/shared';
import { ApiCommonResponses } from '../shared/framework/response.decorator';

import { ListSubscribersCommand } from './usecases/list-subscribers/list-subscribers.command';
import { ListSubscribersUseCase } from './usecases/list-subscribers/list-subscribers.usecase';

@Controller({ path: '/subscribers', version: '2' })
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Subscribers')
@ApiCommonResponses()
export class SubscriberController {
  constructor(private listSubscribersUsecase: ListSubscribersUseCase) {}

  @Get('')
  @UseGuards(UserAuthGuard)
  async getSubscribers(
    @UserSession() user: UserSessionData,
    @Query() query: IListSubscribersRequestDto
  ): Promise<IListSubscribersResponseDto> {
    return await this.listSubscribersUsecase.execute(
      ListSubscribersCommand.create({
        user,
        limit: Number(query.limit || '10'),
        cursor: query.cursor,
        orderDirection: query.orderDirection || DirectionEnum.DESC,
        orderBy: query.orderBy || 'createdAt',
        query: query.query,
        email: query.email,
        phone: query.phone,
        subscriberId: query.subscriberId,
        name: query.name,
      })
    );
  }
}
