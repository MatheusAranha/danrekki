import { Express } from 'express';
import createHttpError from 'http-errors';
import { CreateCharacterV1UseCase } from '../core/use-cases/create';
import { GetCharacterV1UseCase } from '../core/use-cases/get';
import { ListCharactersV1UseCase } from '../core/use-cases/list';
import { UpdateCharacterV1UseCase } from '../core/use-cases/update';
import { DeleteCharacterV1UseCase } from '../core/use-cases/delete';
import { CharacterV1NotFoundError } from '../core/errors';

interface CharacterUseCases {
  createCharacter: CreateCharacterV1UseCase;
  getCharacter: GetCharacterV1UseCase;
  listCharacters: ListCharactersV1UseCase;
  updateCharacter: UpdateCharacterV1UseCase;
  deleteCharacter: DeleteCharacterV1UseCase;
}

export function registerCharacterV1Routes(app: Express, useCases: CharacterUseCases): void {
  app.get('/characters', async (_req, res, next) => {
    try {
      res.json(await useCases.listCharacters.execute());
    } catch (err) {
      next(err);
    }
  });

  app.post('/characters', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.createCharacter.execute(req.body));
    } catch (err) {
      next(err);
    }
  });

  app.get('/characters/:id', async (req, res, next) => {
    try {
      res.json(await useCases.getCharacter.execute({ id: req.params['id'] }));
    } catch (err) {
      if (err instanceof CharacterV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.patch('/characters/:id', async (req, res, next) => {
    try {
      res.json(await useCases.updateCharacter.execute({ id: req.params['id'], ...req.body }));
    } catch (err) {
      if (err instanceof CharacterV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.delete('/characters/:id', async (req, res, next) => {
    try {
      await useCases.deleteCharacter.execute({ id: req.params['id'] });
      res.status(204).send();
    } catch (err) {
      if (err instanceof CharacterV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
