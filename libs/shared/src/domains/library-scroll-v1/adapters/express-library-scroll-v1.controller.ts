import { Express } from 'express';
import createHttpError from 'http-errors';
import { CreateLibraryScrollV1UseCase } from '../core/use-cases/create';
import { GetLibraryScrollV1UseCase } from '../core/use-cases/get';
import { ListLibraryScrollsByLibraryV1UseCase } from '../core/use-cases/list-by-library';
import { UpdateLibraryScrollV1UseCase } from '../core/use-cases/update';
import { DeleteLibraryScrollV1UseCase } from '../core/use-cases/delete';
import { LibraryScrollV1NotFoundError } from '../core/errors';
import { LibraryV1NotFoundError } from '../../library-v1/core/errors';
import { JutsuV1NotFoundError } from '../../jutsu-v1/core/errors';
import { NinjaRankV1NotFoundError } from '../../ninja-rank-v1/core/errors';

interface LibraryScrollUseCases {
  createScroll: CreateLibraryScrollV1UseCase;
  getScroll: GetLibraryScrollV1UseCase;
  listLibraryScrolls: ListLibraryScrollsByLibraryV1UseCase;
  updateScroll: UpdateLibraryScrollV1UseCase;
  deleteScroll: DeleteLibraryScrollV1UseCase;
}

export function registerLibraryScrollV1Routes(app: Express, useCases: LibraryScrollUseCases): void {
  app.get('/libraries/:libraryId/scrolls', async (req, res, next) => {
    try {
      res.json(await useCases.listLibraryScrolls.execute({ library_id: req.params['libraryId'] }));
    } catch (err) {
      next(err);
    }
  });

  app.post('/libraries/:libraryId/scrolls', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.createScroll.execute({ library_id: req.params['libraryId'], ...req.body }));
    } catch (err) {
      if (err instanceof LibraryV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof JutsuV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof NinjaRankV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.get('/libraries/:libraryId/scrolls/:scrollId', async (req, res, next) => {
    try {
      res.json(await useCases.getScroll.execute({ id: req.params['scrollId'] }));
    } catch (err) {
      if (err instanceof LibraryScrollV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.patch('/libraries/:libraryId/scrolls/:scrollId', async (req, res, next) => {
    try {
      res.json(await useCases.updateScroll.execute({ id: req.params['scrollId'], ...req.body }));
    } catch (err) {
      if (err instanceof LibraryScrollV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.delete('/libraries/:libraryId/scrolls/:scrollId', async (req, res, next) => {
    try {
      await useCases.deleteScroll.execute({ id: req.params['scrollId'] });
      res.status(204).send();
    } catch (err) {
      if (err instanceof LibraryScrollV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
