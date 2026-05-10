import { Express } from 'express';
import createHttpError from 'http-errors';
import { AssignCharacterReleaseV1UseCase } from '../core/use-cases/assign';
import { RevokeCharacterReleaseV1UseCase } from '../core/use-cases/revoke';
import { ListByCharacterCharacterReleaseV1UseCase } from '../core/use-cases/list-by-character';
import { CharacterReleaseV1NotFoundError, CharacterReleaseV1AlreadyAssignedError } from '../core/errors';
import { CharacterV1NotFoundError } from '../../character-v1/core/errors';
import { ReleaseV1NotFoundError } from '../../release-v1/core/errors';

interface CharacterReleaseUseCases {
  assignRelease: AssignCharacterReleaseV1UseCase;
  revokeRelease: RevokeCharacterReleaseV1UseCase;
  listCharacterReleases: ListByCharacterCharacterReleaseV1UseCase;
}

export function registerCharacterReleaseV1Routes(app: Express, useCases: CharacterReleaseUseCases): void {
  app.get('/characters/:characterId/releases', async (req, res, next) => {
    try {
      res.json(await useCases.listCharacterReleases.execute({ character_id: req.params['characterId'] }));
    } catch (err) {
      next(err);
    }
  });

  app.post('/characters/:characterId/releases', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.assignRelease.execute({
        character_id: req.params['characterId'],
        release_id: req.body.release_id,
      }));
    } catch (err) {
      if (err instanceof CharacterV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof ReleaseV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof CharacterReleaseV1AlreadyAssignedError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.delete('/characters/:characterId/releases/:releaseAssignmentId', async (req, res, next) => {
    try {
      await useCases.revokeRelease.execute({ id: req.params['releaseAssignmentId'] });
      res.status(204).send();
    } catch (err) {
      if (err instanceof CharacterReleaseV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
