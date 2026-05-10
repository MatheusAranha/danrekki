import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { clanV1EntityJsonSchema } from './entity.schema';
import { IClanV1Dto } from './types';

export class ClanV1Entity {
  private readonly dto: IClanV1Dto;

  constructor({ clanInputData }: { clanInputData: IClanV1Dto }) {
    this.dto = clanInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(clanV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): IClanV1Dto {
    return structuredClone(this.dto);
  }
}
