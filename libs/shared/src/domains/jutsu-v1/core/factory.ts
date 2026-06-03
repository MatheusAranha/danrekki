import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { IJutsuV1Dto } from './types';

class JutsuV1Factory {
  generateOne(params?: { overrides?: Partial<IJutsuV1Dto> }): IJutsuV1Dto {
    const now = new Date().toISOString();
    return {
      _id: randomUUID(),
      name: faker.word.noun(),
      jutsu_rank_id: randomUUID(),
      keyword_ids: [],
      elements: [],
      casting_time: '1 Action',
      range: faker.helpers.arrayElement(['Self', 'Touch', '30 feet', '60 feet', '120 feet']),
      chakra_cost: `${faker.number.int({ min: 1, max: 10 })} Chakra`,
      components: faker.lorem.words(3),
      duration: faker.lorem.word(),
      description: faker.lorem.sentence(),
      at_higher_ranks: null,
      created_at: now,
      updated_at: now,
      ...params?.overrides,
    };
  }
}

export const jutsuV1Factory = new JutsuV1Factory();
