import { Express } from 'express';
import createHttpError from 'http-errors';
import { CreateJutsuRankV1UseCase } from '../core/use-cases/create';
import { GetJutsuRankV1UseCase } from '../core/use-cases/get';
import { ListJutsuRanksV1UseCase } from '../core/use-cases/list';
import { UpdateJutsuRankV1UseCase } from '../core/use-cases/update';
import { DeleteJutsuRankV1UseCase } from '../core/use-cases/delete';
import { JutsuRankV1NotFoundError, JutsuRankV1NameAlreadyExistsError } from '../core/errors';

interface JutsuRankUseCases {
  createJutsuRank: CreateJutsuRankV1UseCase;
  getJutsuRank: GetJutsuRankV1UseCase;
  listJutsuRanks: ListJutsuRanksV1UseCase;
  updateJutsuRank: UpdateJutsuRankV1UseCase;
  deleteJutsuRank: DeleteJutsuRankV1UseCase;
}

export function registerJutsuRankV1Routes(app: Express, useCases: JutsuRankUseCases): void {
  app.get('/jutsu-ranks', async (_req, res, next) => {
    try {
      res.json(await useCases.listJutsuRanks.execute());
    } catch (err) {
      next(err);
    }
  });

  app.post('/jutsu-ranks', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.createJutsuRank.execute(req.body));
    } catch (err) {
      if (err instanceof JutsuRankV1NameAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.get('/jutsu-ranks/:id', async (req, res, next) => {
    try {
      res.json(await useCases.getJutsuRank.execute({ id: req.params['id'] }));
    } catch (err) {
      if (err instanceof JutsuRankV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.patch('/jutsu-ranks/:id', async (req, res, next) => {
    try {
      res.json(await useCases.updateJutsuRank.execute({ id: req.params['id'], ...req.body }));
    } catch (err) {
      if (err instanceof JutsuRankV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof JutsuRankV1NameAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.delete('/jutsu-ranks/:id', async (req, res, next) => {
    try {
      await useCases.deleteJutsuRank.execute({ id: req.params['id'] });
      res.status(204).send();
    } catch (err) {
      if (err instanceof JutsuRankV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
