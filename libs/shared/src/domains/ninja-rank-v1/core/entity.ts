import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { ninjaRankV1EntityJsonSchema } from './entity.schema';
import { INinjaRankV1Dto } from './types';

export class NinjaRankV1Entity {
  private readonly dto: INinjaRankV1Dto;

  constructor({ ninjaRankInputData }: { ninjaRankInputData: INinjaRankV1Dto }) {
    this.dto = ninjaRankInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(ninjaRankV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): INinjaRankV1Dto {
    return structuredClone(this.dto);
  }
}
