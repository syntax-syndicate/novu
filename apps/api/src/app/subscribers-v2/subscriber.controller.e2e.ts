import { randomBytes } from 'crypto';
import { UserSession } from '@novu/testing';
import { expect } from 'chai';

const v2Prefix = '/v2';
let session: UserSession;

describe('List Subscriber Permutations', () => {
  it('should not return subscribers if not matching query', async () => {
    await createSubscriberAndValidate('XYZ');
    await createSubscriberAndValidate('XYZ2');
    const subscribers = await getAllAndValidate({
      searchQuery: 'ABC',
      expectedTotalResults: 0,
      expectedArraySize: 0,
    });
    expect(subscribers).to.be.empty;
  });

  it('should not return subscribers if offset is bigger than available subscribers', async () => {
    const uuid = generateUUID();
    await create10Subscribers(uuid);
    await getAllAndValidate({
      searchQuery: uuid,
      offset: 11,
      limit: 15,
      expectedTotalResults: 10,
      expectedArraySize: 0,
    });
  });

  it('should return all results within range', async () => {
    const uuid = generateUUID();
    await create10Subscribers(uuid);
    await getAllAndValidate({
      searchQuery: uuid,
      offset: 0,
      limit: 15,
      expectedTotalResults: 10,
      expectedArraySize: 10,
    });
  });

  it('should return results without query', async () => {
    const uuid = generateUUID();
    await create10Subscribers(uuid);
    await getAllAndValidate({
      searchQuery: uuid,
      offset: 0,
      limit: 15,
      expectedTotalResults: 10,
      expectedArraySize: 10,
    });
  });

  it('should page subscribers without overlap', async () => {
    const uuid = generateUUID();
    await create10Subscribers(uuid);
    const listResponse1 = await getAllAndValidate({
      searchQuery: uuid,
      offset: 0,
      limit: 5,
      expectedTotalResults: 10,
      expectedArraySize: 5,
    });
    const listResponse2 = await getAllAndValidate({
      searchQuery: uuid,
      offset: 5,
      limit: 5,
      expectedTotalResults: 10,
      expectedArraySize: 5,
    });
    const idsDeduplicated = buildIdSet(listResponse1, listResponse2);
    expect(idsDeduplicated.size).to.be.equal(10);
  });
});

// Helper functions
async function createSubscriberAndValidate(nameSuffix: string = '') {
  const createSubscriberDto = {
    subscriberId: `test-subscriber-${nameSuffix}`,
    firstName: `Test ${nameSuffix}`,
    lastName: 'Subscriber',
    email: `test-${nameSuffix}@subscriber.com`,
    phone: '+1234567890',
  };

  const res = await session.testAgent.post(`/v1/subscribers`).send(createSubscriberDto);
  expect(res.status).to.equal(201);

  const subscriber = res.body.data;
  validateCreateSubscriberResponse(subscriber, createSubscriberDto);

  return subscriber;
}

async function create10Subscribers(uuid: string) {
  for (let i = 0; i < 10; i += 1) {
    await createSubscriberAndValidate(`${uuid}-${i}`);
  }
}

async function getListSubscribers(query: string, offset: number, limit: number) {
  const res = await session.testAgent.get(`${v2Prefix}/subscribers`).query({
    query,
    page: Math.floor(offset / limit) + 1,
    limit,
  });
  expect(res.status).to.equal(200);

  return res.body.data;
}

interface IAllAndValidate {
  msgPrefix?: string;
  searchQuery: string;
  offset?: number;
  limit?: number;
  expectedTotalResults: number;
  expectedArraySize: number;
}

async function getAllAndValidate({
  msgPrefix = '',
  searchQuery = '',
  offset = 0,
  limit = 50,
  expectedTotalResults,
  expectedArraySize,
}: IAllAndValidate) {
  const listResponse = await getListSubscribers(searchQuery, offset, limit);
  const summary = buildLogMsg(
    {
      msgPrefix,
      searchQuery,
      offset,
      limit,
      expectedTotalResults,
      expectedArraySize,
    },
    listResponse
  );

  expect(listResponse.subscribers).to.be.an('array', summary);
  expect(listResponse.subscribers).lengthOf(expectedArraySize, `subscribers length ${summary}`);
  expect(listResponse.totalCount).to.be.equal(expectedTotalResults, `total Results don't match ${summary}`);

  return listResponse.subscribers;
}

function buildLogMsg(params: IAllAndValidate, listResponse: any): string {
  return `Log - msgPrefix: ${params.msgPrefix}, 
  searchQuery: ${params.searchQuery}, 
  offset: ${params.offset}, 
  limit: ${params.limit}, 
  expectedTotalResults: ${params.expectedTotalResults ?? 'Not specified'}, 
  expectedArraySize: ${params.expectedArraySize ?? 'Not specified'}
  response: 
  ${JSON.stringify(listResponse || 'Not specified', null, 2)}`;
}

function buildIdSet(listResponse1: any[], listResponse2: any[]) {
  return new Set([...extractIDs(listResponse1), ...extractIDs(listResponse2)]);
}

function extractIDs(subscribers: any[]) {
  return subscribers.map((subscriber) => subscriber._id);
}

function generateUUID(): string {
  const randomHex = () => randomBytes(2).toString('hex');

  return `${randomHex()}${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}${randomHex()}${randomHex()}`;
}

function validateCreateSubscriberResponse(subscriber: any, createDto: any) {
  expect(subscriber).to.be.ok;
  expect(subscriber._id).to.be.ok;
  expect(subscriber.subscriberId).to.equal(createDto.subscriberId);
  expect(subscriber.firstName).to.equal(createDto.firstName);
  expect(subscriber.lastName).to.equal(createDto.lastName);
  expect(subscriber.email).to.equal(createDto.email);
  expect(subscriber.phone).to.equal(createDto.phone);
}
