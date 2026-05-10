import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { jutsuV1EntityJsonSchema } from './entity.schema';
import { IJutsuV1Dto } from './types';

export class JutsuV1Entity {
  private readonly dto: IJutsuV1Dto;

  constructor({ jutsuInputData }: { jutsuInputData: IJutsuV1Dto }) {
    this.dto = jutsuInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(jutsuV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): IJutsuV1Dto {
    return structuredClone(this.dto);
  }
}
