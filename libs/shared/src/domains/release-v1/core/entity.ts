import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { keywordV1EntityJsonSchema } from './entity.schema';
import { IKeywordV1Dto } from './types';

export class KeywordV1Entity {
  private readonly dto: IKeywordV1Dto;

  constructor({ keywordInputData }: { keywordInputData: IKeywordV1Dto }) {
    this.dto = keywordInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(keywordV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): IKeywordV1Dto {
    return structuredClone(this.dto);
  }
}
