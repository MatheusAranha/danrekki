import { Express } from 'express';
import createHttpError from 'http-errors';
import { CreateJutsuV1UseCase } from '../core/use-cases/create';
import { GetJutsuV1UseCase } from '../core/use-cases/get';
import { ListJutsusV1UseCase } from '../core/use-cases/list';
import { UpdateJutsuV1UseCase } from '../core/use-cases/update';
import { DeleteJutsuV1UseCase } from '../core/use-cases/delete';
import { JutsuV1NotFoundError, JutsuV1NameAlreadyExistsError } from '../core/errors';

interface JutsuUseCases {
  createJutsu: CreateJutsuV1UseCase;
  getJutsu: GetJutsuV1UseCase;
  listJutsus: ListJutsusV1UseCase;
  updateJutsu: UpdateJutsuV1UseCase;
  deleteJutsu: DeleteJutsuV1UseCase;
}

export function registerJutsuV1Routes(app: Express, useCases: JutsuUseCases): void {
  app.get('/jutsus', async (_req, res, next) => {
    try {
      res.json(await useCases.listJutsus.execute());
    } catch (err) {
      next(err);
    }
  });

  app.post('/jutsus', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.createJutsu.execute(req.body));
    } catch (err) {
      if (err instanceof JutsuV1NameAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.get('/jutsus/:id', async (req, res, next) => {
    try {
      res.json(await useCases.getJutsu.execute({ id: req.params['id'] }));
    } catch (err) {
      if (err instanceof JutsuV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.patch('/jutsus/:id', async (req, res, next) => {
    try {
      res.json(await useCases.updateJutsu.execute({ id: req.params['id'], ...req.body }));
    } catch (err) {
      if (err instanceof JutsuV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof JutsuV1NameAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.delete('/jutsus/:id', async (req, res, next) => {
    try {
      await useCases.deleteJutsu.execute({ id: req.params['id'] });
      res.status(204).send();
    } catch (err) {
      if (err instanceof JutsuV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
