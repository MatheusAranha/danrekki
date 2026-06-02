import { Express } from 'express';
import createHttpError from 'http-errors';
import { AssignCharacterKeywordV1UseCase } from '../core/use-cases/assign';
import { RevokeCharacterKeywordV1UseCase } from '../core/use-cases/revoke';
import { ListByCharacterCharacterKeywordV1UseCase } from '../core/use-cases/list-by-character';
import { CharacterKeywordV1NotFoundError, CharacterKeywordV1AlreadyAssignedError } from '../core/errors';
import { CharacterV1NotFoundError } from '../../character-v1/core/errors';
import { KeywordV1NotFoundError } from '../../release-v1/core/errors';

interface CharacterKeywordUseCases {
  assignKeyword: AssignCharacterKeywordV1UseCase;
  revokeKeyword: RevokeCharacterKeywordV1UseCase;
  listCharacterKeywords: ListByCharacterCharacterKeywordV1UseCase;
}

export function registerCharacterKeywordV1Routes(app: Express, useCases: CharacterKeywordUseCases): void {
  app.get('/characters/:characterId/keywords', async (req, res, next) => {
    try {
      res.json(await useCases.listCharacterKeywords.execute({ character_id: req.params['characterId'] }));
    } catch (err) {
      next(err);
    }
  });

  app.post('/characters/:characterId/keywords', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.assignKeyword.execute({
        character_id: req.params['characterId'],
        keyword_id: req.body.keyword_id,
      }));
    } catch (err) {
      if (err instanceof CharacterV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof KeywordV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof CharacterKeywordV1AlreadyAssignedError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.delete('/characters/:characterId/releases/:releaseAssignmentId', async (req, res, next) => {
    try {
      await useCases.revokeKeyword.execute({ id: req.params['releaseAssignmentId'] });
      res.status(204).send();
    } catch (err) {
      if (err instanceof CharacterKeywordV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
