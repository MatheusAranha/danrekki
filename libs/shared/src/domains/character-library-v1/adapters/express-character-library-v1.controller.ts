import { Express } from 'express';
import createHttpError from 'http-errors';
import { AssignCharacterLibraryV1UseCase } from '../core/use-cases/assign';
import { GetCharacterLibraryV1UseCase } from '../core/use-cases/get';
import { ListByCharacterCharacterLibraryV1UseCase } from '../core/use-cases/list-by-character';
import { DeleteCharacterLibraryV1UseCase } from '../core/use-cases/delete';
import { CharacterLibraryV1NotFoundError, CharacterLibraryV1AlreadyAssignedError } from '../core/errors';
import { CharacterV1NotFoundError } from '../../character-v1/core/errors';
import { LibraryV1NotFoundError } from '../../library-v1/core/errors';
import { NinjaRankV1NotFoundError } from '../../ninja-rank-v1/core/errors';

interface CharacterLibraryUseCases {
  assignLibrary: AssignCharacterLibraryV1UseCase;
  getCharacterLibrary: GetCharacterLibraryV1UseCase;
  listCharacterLibraries: ListByCharacterCharacterLibraryV1UseCase;
  deleteCharacterLibrary: DeleteCharacterLibraryV1UseCase;
}

export function registerCharacterLibraryV1Routes(app: Express, useCases: CharacterLibraryUseCases): void {
  app.get('/characters/:characterId/libraries', async (req, res, next) => {
    try {
      res.json(await useCases.listCharacterLibraries.execute({ character_id: req.params['characterId'] }));
    } catch (err) {
      next(err);
    }
  });

  app.post('/characters/:characterId/libraries', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.assignLibrary.execute({
        character_id: req.params['characterId'],
        ...req.body,
      }));
    } catch (err) {
      if (err instanceof CharacterV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof LibraryV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof NinjaRankV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof CharacterLibraryV1AlreadyAssignedError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.get('/characters/:characterId/libraries/:assignmentId', async (req, res, next) => {
    try {
      res.json(await useCases.getCharacterLibrary.execute({ id: req.params['assignmentId'] }));
    } catch (err) {
      if (err instanceof CharacterLibraryV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.delete('/characters/:characterId/libraries/:assignmentId', async (req, res, next) => {
    try {
      await useCases.deleteCharacterLibrary.execute({ id: req.params['assignmentId'] });
      res.status(204).send();
    } catch (err) {
      if (err instanceof CharacterLibraryV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
