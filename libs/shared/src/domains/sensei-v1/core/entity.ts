import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { senseiV1EntityJsonSchema } from './entity.schema';
import { ISenseiV1Dto } from './types';

export class SenseiV1Entity {
  private readonly dto: ISenseiV1Dto;

  constructor({ senseiInputData }: { senseiInputData: ISenseiV1Dto }) {
    this.dto = senseiInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(senseiV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): ISenseiV1Dto {
    return structuredClone(this.dto);
  }
}
