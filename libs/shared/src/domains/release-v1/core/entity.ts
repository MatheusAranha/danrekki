import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { releaseV1EntityJsonSchema } from './entity.schema';
import { IReleaseV1Dto } from './types';

export class ReleaseV1Entity {
  private readonly dto: IReleaseV1Dto;

  constructor({ releaseInputData }: { releaseInputData: IReleaseV1Dto }) {
    this.dto = releaseInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(releaseV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): IReleaseV1Dto {
    return structuredClone(this.dto);
  }
}
