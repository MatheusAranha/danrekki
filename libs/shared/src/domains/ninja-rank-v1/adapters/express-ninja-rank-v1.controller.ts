import { Express } from 'express';
import createHttpError from 'http-errors';
import { CreateNinjaRankV1UseCase } from '../core/use-cases/create';
import { GetNinjaRankV1UseCase } from '../core/use-cases/get';
import { ListNinjaRanksV1UseCase } from '../core/use-cases/list';
import { UpdateNinjaRankV1UseCase } from '../core/use-cases/update';
import { DeleteNinjaRankV1UseCase } from '../core/use-cases/delete';
import { NinjaRankV1NotFoundError, NinjaRankV1NameAlreadyExistsError } from '../core/errors';

interface NinjaRankUseCases {
  createNinjaRank: CreateNinjaRankV1UseCase;
  getNinjaRank: GetNinjaRankV1UseCase;
  listNinjaRanks: ListNinjaRanksV1UseCase;
  updateNinjaRank: UpdateNinjaRankV1UseCase;
  deleteNinjaRank: DeleteNinjaRankV1UseCase;
}

export function registerNinjaRankV1Routes(app: Express, useCases: NinjaRankUseCases): void {
  app.get('/ninja-ranks', async (_req, res, next) => {
    try {
      res.json(await useCases.listNinjaRanks.execute());
    } catch (err) {
      next(err);
    }
  });

  app.post('/ninja-ranks', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.createNinjaRank.execute(req.body));
    } catch (err) {
      if (err instanceof NinjaRankV1NameAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.get('/ninja-ranks/:id', async (req, res, next) => {
    try {
      res.json(await useCases.getNinjaRank.execute({ id: req.params['id'] }));
    } catch (err) {
      if (err instanceof NinjaRankV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.patch('/ninja-ranks/:id', async (req, res, next) => {
    try {
      res.json(await useCases.updateNinjaRank.execute({ id: req.params['id'], ...req.body }));
    } catch (err) {
      if (err instanceof NinjaRankV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof NinjaRankV1NameAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.delete('/ninja-ranks/:id', async (req, res, next) => {
    try {
      await useCases.deleteNinjaRank.execute({ id: req.params['id'] });
      res.status(204).send();
    } catch (err) {
      if (err instanceof NinjaRankV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
