import { Express } from 'express';
import createHttpError from 'http-errors';
import { AssignCharacterSenseiV1UseCase } from '../core/use-cases/assign';
import { GetCharacterSenseiV1UseCase } from '../core/use-cases/get';
import { ListByCharacterCharacterSenseiV1UseCase } from '../core/use-cases/list-by-character';
import { DeleteCharacterSenseiV1UseCase } from '../core/use-cases/delete';
import { CharacterSenseiV1NotFoundError, CharacterSenseiV1AlreadyAssignedError } from '../core/errors';
import { CharacterV1NotFoundError } from '../../character-v1/core/errors';
import { SenseiV1NotFoundError } from '../../sensei-v1/core/errors';

interface CharacterSenseiUseCases {
  assignSensei: AssignCharacterSenseiV1UseCase;
  getCharacterSensei: GetCharacterSenseiV1UseCase;
  listCharacterSenseis: ListByCharacterCharacterSenseiV1UseCase;
  deleteCharacterSensei: DeleteCharacterSenseiV1UseCase;
}

export function registerCharacterSenseiV1Routes(app: Express, useCases: CharacterSenseiUseCases): void {
  app.get('/characters/:characterId/senseis', async (req, res, next) => {
    try {
      res.json(await useCases.listCharacterSenseis.execute({ character_id: req.params['characterId'] }));
    } catch (err) {
      next(err);
    }
  });

  app.post('/characters/:characterId/senseis', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.assignSensei.execute({
        character_id: req.params['characterId'],
        ...req.body,
      }));
    } catch (err) {
      if (err instanceof CharacterV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof SenseiV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof CharacterSenseiV1AlreadyAssignedError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.get('/characters/:characterId/senseis/:assignmentId', async (req, res, next) => {
    try {
      res.json(await useCases.getCharacterSensei.execute({ id: req.params['assignmentId'] }));
    } catch (err) {
      if (err instanceof CharacterSenseiV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.delete('/characters/:characterId/senseis/:assignmentId', async (req, res, next) => {
    try {
      await useCases.deleteCharacterSensei.execute({ id: req.params['assignmentId'] });
      res.status(204).send();
    } catch (err) {
      if (err instanceof CharacterSenseiV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
