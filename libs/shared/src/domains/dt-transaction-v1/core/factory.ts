import { faker } from '@faker-js/faker';
import jsf, { Schema } from 'json-schema-faker';
import { dtTransactionV1EntityJsonSchema } from './entity.schema';
import { IDtTransactionV1Dto } from './types';

jsf.extend('faker', () => faker);

export const dtTransactionV1Factory = {
  generateOne(options?: { overrides?: Partial<IDtTransactionV1Dto> }): IDtTransactionV1Dto {
    const generated = jsf.generate(dtTransactionV1EntityJsonSchema as Schema) as unknown as IDtTransactionV1Dto;
    return { ...generated, ...options?.overrides };
  },
};
