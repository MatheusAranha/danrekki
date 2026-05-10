import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { jutsuRankV1EntityJsonSchema } from './entity.schema';
import { IJutsuRankV1Dto } from './types';

export class JutsuRankV1Entity {
  private readonly dto: IJutsuRankV1Dto;

  constructor({ jutsuRankInputData }: { jutsuRankInputData: IJutsuRankV1Dto }) {
    this.dto = jutsuRankInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(jutsuRankV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): IJutsuRankV1Dto {
    return structuredClone(this.dto);
  }
}
