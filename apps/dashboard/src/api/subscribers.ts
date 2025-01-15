import type { IEnvironment, IListSubscribersResponseDto } from '@novu/shared';
import { getV2 } from './api.client';

export const getSubscribers = async ({
  environment,
  cursor,
  limit,
  query,
  email,
  phone,
  subscriberId,
  name,
}: {
  environment: IEnvironment;
  cursor: string;
  query: string;
  limit: number;
  email?: string;
  phone?: string;
  subscriberId?: string;
  name?: string;
}): Promise<IListSubscribersResponseDto> => {
  const { data } = await getV2<{ data: IListSubscribersResponseDto }>(
    `/subscribers?cursor=${cursor}&limit=${limit}&query=${query}&email=${email}&phone=${phone}&subscriberId=${subscriberId}&name=${name}`,
    {
      environment,
    }
  );
  return data;
};
