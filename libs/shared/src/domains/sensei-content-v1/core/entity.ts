import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { senseiContentV1EntityJsonSchema } from './entity.schema';
import { ISenseiContentV1Dto } from './types';

export class SenseiContentV1Entity {
  private readonly dto: ISenseiContentV1Dto;

  constructor({ senseiContentInputData }: { senseiContentInputData: ISenseiContentV1Dto }) {
    this.dto = senseiContentInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(senseiContentV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): ISenseiContentV1Dto {
    return structuredClone(this.dto);
  }
}
