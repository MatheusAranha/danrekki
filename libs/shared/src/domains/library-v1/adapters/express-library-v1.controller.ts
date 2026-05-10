import { Express } from 'express';
import createHttpError from 'http-errors';
import { CreateLibraryV1UseCase } from '../core/use-cases/create';
import { GetLibraryV1UseCase } from '../core/use-cases/get';
import { ListLibrariesV1UseCase } from '../core/use-cases/list';
import { UpdateLibraryV1UseCase } from '../core/use-cases/update';
import { DeleteLibraryV1UseCase } from '../core/use-cases/delete';
import { LibraryV1NotFoundError, LibraryV1NameAlreadyExistsError } from '../core/errors';

interface LibraryUseCases {
  createLibrary: CreateLibraryV1UseCase;
  getLibrary: GetLibraryV1UseCase;
  listLibraries: ListLibrariesV1UseCase;
  updateLibrary: UpdateLibraryV1UseCase;
  deleteLibrary: DeleteLibraryV1UseCase;
}

export function registerLibraryV1Routes(app: Express, useCases: LibraryUseCases): void {
  app.get('/libraries', async (_req, res, next) => {
    try {
      res.json(await useCases.listLibraries.execute());
    } catch (err) {
      next(err);
    }
  });

  app.post('/libraries', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.createLibrary.execute(req.body));
    } catch (err) {
      if (err instanceof LibraryV1NameAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.get('/libraries/:id', async (req, res, next) => {
    try {
      res.json(await useCases.getLibrary.execute({ id: req.params['id'] }));
    } catch (err) {
      if (err instanceof LibraryV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.patch('/libraries/:id', async (req, res, next) => {
    try {
      res.json(await useCases.updateLibrary.execute({ id: req.params['id'], ...req.body }));
    } catch (err) {
      if (err instanceof LibraryV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof LibraryV1NameAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.delete('/libraries/:id', async (req, res, next) => {
    try {
      await useCases.deleteLibrary.execute({ id: req.params['id'] });
      res.status(204).send();
    } catch (err) {
      if (err instanceof LibraryV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
