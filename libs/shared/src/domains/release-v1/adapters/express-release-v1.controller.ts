import { Express } from 'express';
import createHttpError from 'http-errors';
import { CreateReleaseV1UseCase } from '../core/use-cases/create';
import { GetReleaseV1UseCase } from '../core/use-cases/get';
import { ListReleasesV1UseCase } from '../core/use-cases/list';
import { UpdateReleaseV1UseCase } from '../core/use-cases/update';
import { DeleteReleaseV1UseCase } from '../core/use-cases/delete';
import { ReleaseV1NotFoundError, ReleaseV1NameAlreadyExistsError } from '../core/errors';

interface ReleaseUseCases {
  createRelease: CreateReleaseV1UseCase;
  getRelease: GetReleaseV1UseCase;
  listReleases: ListReleasesV1UseCase;
  updateRelease: UpdateReleaseV1UseCase;
  deleteRelease: DeleteReleaseV1UseCase;
}

export function registerReleaseV1Routes(app: Express, useCases: ReleaseUseCases): void {
  app.get('/releases', async (_req, res, next) => {
    try {
      res.json(await useCases.listReleases.execute());
    } catch (err) {
      next(err);
    }
  });

  app.post('/releases', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.createRelease.execute(req.body));
    } catch (err) {
      if (err instanceof ReleaseV1NameAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.get('/releases/:id', async (req, res, next) => {
    try {
      res.json(await useCases.getRelease.execute({ id: req.params['id'] }));
    } catch (err) {
      if (err instanceof ReleaseV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.patch('/releases/:id', async (req, res, next) => {
    try {
      res.json(await useCases.updateRelease.execute({ id: req.params['id'], ...req.body }));
    } catch (err) {
      if (err instanceof ReleaseV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof ReleaseV1NameAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.delete('/releases/:id', async (req, res, next) => {
    try {
      await useCases.deleteRelease.execute({ id: req.params['id'] });
      res.status(204).send();
    } catch (err) {
      if (err instanceof ReleaseV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
