import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { IKeywordV1Dto } from './types';

class KeywordV1Factory {
  generateOne(params?: { overrides?: Partial<IKeywordV1Dto> }): IKeywordV1Dto {
    const now = new Date().toISOString();
    return {
      _id: randomUUID(),
      name: faker.word.adjective(),
      created_at: now,
      updated_at: now,
      ...params?.overrides,
    };
  }
}

export const keywordV1Factory = new KeywordV1Factory();
