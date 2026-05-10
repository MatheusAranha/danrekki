import { Express } from 'express';
import createHttpError from 'http-errors';
import { CreateSenseiV1UseCase } from '../core/use-cases/create';
import { GetSenseiV1UseCase } from '../core/use-cases/get';
import { ListSenseiV1UseCase } from '../core/use-cases/list';
import { UpdateSenseiV1UseCase } from '../core/use-cases/update';
import { DeleteSenseiV1UseCase } from '../core/use-cases/delete';
import { SenseiV1NotFoundError, SenseiV1NameAlreadyExistsError } from '../core/errors';

interface SenseiUseCases {
  createSensei: CreateSenseiV1UseCase;
  getSensei: GetSenseiV1UseCase;
  listSenseis: ListSenseiV1UseCase;
  updateSensei: UpdateSenseiV1UseCase;
  deleteSensei: DeleteSenseiV1UseCase;
}

export function registerSenseiV1Routes(app: Express, useCases: SenseiUseCases): void {
  app.get('/senseis', async (_req, res, next) => {
    try {
      res.json(await useCases.listSenseis.execute());
    } catch (err) {
      next(err);
    }
  });

  app.post('/senseis', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.createSensei.execute(req.body));
    } catch (err) {
      if (err instanceof SenseiV1NameAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.get('/senseis/:id', async (req, res, next) => {
    try {
      res.json(await useCases.getSensei.execute({ id: req.params['id'] }));
    } catch (err) {
      if (err instanceof SenseiV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.patch('/senseis/:id', async (req, res, next) => {
    try {
      res.json(await useCases.updateSensei.execute({ id: req.params['id'], ...req.body }));
    } catch (err) {
      if (err instanceof SenseiV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof SenseiV1NameAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.delete('/senseis/:id', async (req, res, next) => {
    try {
      await useCases.deleteSensei.execute({ id: req.params['id'] });
      res.status(204).send();
    } catch (err) {
      if (err instanceof SenseiV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
