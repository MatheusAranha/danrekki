import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { trainableContentV1EntityJsonSchema } from './entity.schema';
import { ITrainableContentV1Dto } from './types';

export class TrainableContentV1Entity {
  private readonly dto: ITrainableContentV1Dto;

  constructor({ contentInputData }: { contentInputData: ITrainableContentV1Dto }) {
    this.dto = contentInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(trainableContentV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): ITrainableContentV1Dto {
    return structuredClone(this.dto);
  }
}
