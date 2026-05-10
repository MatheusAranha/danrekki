import { Express } from 'express';
import createHttpError from 'http-errors';
import { CreateClanV1UseCase } from '../core/use-cases/create';
import { GetClanV1UseCase } from '../core/use-cases/get';
import { ListClansV1UseCase } from '../core/use-cases/list';
import { UpdateClanV1UseCase } from '../core/use-cases/update';
import { DeleteClanV1UseCase } from '../core/use-cases/delete';
import { ClanV1NotFoundError, ClanV1NameAlreadyExistsError } from '../core/errors';

interface ClanUseCases {
  createClan: CreateClanV1UseCase;
  getClan: GetClanV1UseCase;
  listClans: ListClansV1UseCase;
  updateClan: UpdateClanV1UseCase;
  deleteClan: DeleteClanV1UseCase;
}

export function registerClanV1Routes(app: Express, useCases: ClanUseCases): void {
  app.get('/clans', async (_req, res, next) => {
    try {
      res.json(await useCases.listClans.execute());
    } catch (err) {
      next(err);
    }
  });

  app.post('/clans', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.createClan.execute(req.body));
    } catch (err) {
      if (err instanceof ClanV1NameAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.get('/clans/:id', async (req, res, next) => {
    try {
      res.json(await useCases.getClan.execute({ id: req.params['id'] }));
    } catch (err) {
      if (err instanceof ClanV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.patch('/clans/:id', async (req, res, next) => {
    try {
      res.json(await useCases.updateClan.execute({ id: req.params['id'], ...req.body }));
    } catch (err) {
      if (err instanceof ClanV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof ClanV1NameAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.delete('/clans/:id', async (req, res, next) => {
    try {
      await useCases.deleteClan.execute({ id: req.params['id'] });
      res.status(204).send();
    } catch (err) {
      if (err instanceof ClanV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
