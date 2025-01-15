import { Injectable } from '@nestjs/common';
import { InstrumentUsecase } from '@novu/application-generic';
import { SubscriberRepository } from '@novu/dal';
import { DirectionEnum, IListSubscribersResponseDto } from '@novu/shared';
import { ListSubscribersCommand } from './list-subscribers.command';

@Injectable()
export class ListSubscribersUseCase {
  constructor(private subscriberRepository: SubscriberRepository) {}

  @InstrumentUsecase()
  async execute(command: ListSubscribersCommand): Promise<IListSubscribersResponseDto> {
    const query = {
      _environmentId: command.user.environmentId,
      _organizationId: command.user.organizationId,
    } as const;

    if (command.query || command.email || command.phone || command.subscriberId || command.name) {
      const searchConditions: Record<string, unknown>[] = [];

      if (command.query) {
        searchConditions.push(
          ...[
            { subscriberId: { $regex: command.query, $options: 'i' } },
            { email: { $regex: command.query, $options: 'i' } },
            { phone: { $regex: command.query, $options: 'i' } },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ['$firstName', ' ', '$lastName'] },
                  regex: command.query,
                  options: 'i',
                },
              },
            },
          ]
        );
      }

      if (command.email) {
        searchConditions.push({ email: { $regex: command.email, $options: 'i' } });
      }

      if (command.phone) {
        searchConditions.push({ phone: { $regex: command.phone, $options: 'i' } });
      }

      if (command.subscriberId) {
        searchConditions.push({ subscriberId: { $regex: command.subscriberId, $options: 'i' } });
      }

      if (command.name) {
        searchConditions.push({
          $expr: {
            $regexMatch: {
              input: { $concat: ['$firstName', ' ', '$lastName'] },
              regex: command.name,
              options: 'i',
            },
          },
        });
      }

      Object.assign(query, { $or: searchConditions });
    }

    if (command.cursor) {
      const operator = command.orderDirection === DirectionEnum.ASC ? '$gt' : '$lt';
      Object.assign(query, {
        subscriberId: { [operator]: command.cursor },
      });
    }

    const subscribers = await this.subscriberRepository.find(query, undefined, {
      limit: command.limit + 1, // Get one extra to determine if there are more items
      sort: { [command.orderBy]: command.orderDirection === DirectionEnum.ASC ? 1 : -1 },
    });

    const hasMore = subscribers.length > command.limit;
    const data = hasMore ? subscribers.slice(0, -1) : subscribers;

    return {
      subscribers: data,
      hasMore,
      pageSize: command.limit,
      nextCursor: hasMore ? subscribers[subscribers.length - 1].subscriberId : undefined,
    };
  }
}
