import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { dtTransactionV1EntityJsonSchema } from './entity.schema';
import { IDtTransactionV1Dto } from './types';

export class DtTransactionV1Entity {
  private readonly dto: IDtTransactionV1Dto;

  constructor({ transactionInputData }: { transactionInputData: IDtTransactionV1Dto }) {
    this.dto = transactionInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(dtTransactionV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): IDtTransactionV1Dto {
    return { ...this.dto };
  }
}
