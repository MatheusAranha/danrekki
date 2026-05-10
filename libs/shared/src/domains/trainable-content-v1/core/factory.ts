import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { ITrainableContentV1Dto, TrainableContentType } from './types';

class TrainableContentV1Factory {
  generateOne(params?: { overrides?: Partial<ITrainableContentV1Dto> }): ITrainableContentV1Dto {
    const now = new Date().toISOString();
    return {
      _id: randomUUID(),
      type: faker.helpers.arrayElement<TrainableContentType>(['jutsu', 'tool', 'weapon_or_armor', 'skill_proficiency', 'feat']),
      jutsu_id: null,
      name: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      base_dt_cost: faker.helpers.arrayElement([16, 32, 64, 128]),
      created_at: now,
      updated_at: now,
      ...params?.overrides,
    };
  }
}

export const trainableContentV1Factory = new TrainableContentV1Factory();
