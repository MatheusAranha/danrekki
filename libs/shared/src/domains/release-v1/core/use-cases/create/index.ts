import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { KeywordV1Entity } from '../../entity';
import { KeywordV1DatabaseRepository } from '../../database-repository';
import { KeywordV1NameAlreadyExistsError } from '../../errors';
import { createKeywordV1InputDtoJsonSchema } from './input-dto.schema';
import { ICreateKeywordV1UseCaseInputDto, ICreateKeywordV1UseCaseOutputDto } from './types';

export class CreateKeywordV1UseCase {
  constructor(private readonly keywordRepository: KeywordV1DatabaseRepository) {}

  async execute(inputDto: ICreateKeywordV1UseCaseInputDto): Promise<ICreateKeywordV1UseCaseOutputDto> {
    const log: ILog = { module: CreateKeywordV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(createKeywordV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const existing = await this.keywordRepository.findByName(inputDto.name);
      if (existing) throw new KeywordV1NameAlreadyExistsError(`Keyword name "${inputDto.name}" already exists`);
      log.steps.push({ message: 'Verified name is unique.' });

      const now = new Date().toISOString();
      const dto = new KeywordV1Entity({
        keywordInputData: {
          _id: randomUUID(),
          name: inputDto.name,
          created_at: now,
          updated_at: now,
        },
      }).validate().getDto();
      log.steps.push({ message: 'Built and validated KeywordV1Entity.' });

      const saved = await this.keywordRepository.save(dto);
      log.steps.push({ message: `Release "${saved.name}" persisted with id ${saved._id}.` });

      logInfo(`Keyword created: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while creating KeywordV1.' });
      logError('Error creating KeywordV1', log);
      throw err;
    }
  }
}
