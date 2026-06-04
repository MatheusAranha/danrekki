import { Express } from 'express';
import createHttpError from 'http-errors';
import { CreateKeywordV1UseCase } from '../core/use-cases/create';
import { GetKeywordV1UseCase } from '../core/use-cases/get';
import { ListKeywordsV1UseCase } from '../core/use-cases/list';
import { UpdateKeywordV1UseCase } from '../core/use-cases/update';
import { DeleteKeywordV1UseCase } from '../core/use-cases/delete';
import { KeywordV1NotFoundError, KeywordV1NameAlreadyExistsError } from '../core/errors';

interface KeywordUseCases {
  createKeyword: CreateKeywordV1UseCase;
  getKeyword: GetKeywordV1UseCase;
  listKeywords: ListKeywordsV1UseCase;
  updateKeyword: UpdateKeywordV1UseCase;
  deleteKeyword: DeleteKeywordV1UseCase;
}

export function registerKeywordV1Routes(app: Express, useCases: KeywordUseCases): void {
  app.get('/keywords', async (_req, res, next) => {
    try {
      res.json(await useCases.listKeywords.execute());
    } catch (err) {
      next(err);
    }
  });

  app.post('/keywords', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.createKeyword.execute(req.body));
    } catch (err) {
      if (err instanceof KeywordV1NameAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.get('/keywords/:id', async (req, res, next) => {
    try {
      res.json(await useCases.getKeyword.execute({ id: req.params['id'] }));
    } catch (err) {
      if (err instanceof KeywordV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.patch('/keywords/:id', async (req, res, next) => {
    try {
      res.json(await useCases.updateKeyword.execute({ id: req.params['id'], ...req.body }));
    } catch (err) {
      if (err instanceof KeywordV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof KeywordV1NameAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.delete('/keywords/:id', async (req, res, next) => {
    try {
      await useCases.deleteKeyword.execute({ id: req.params['id'] });
      res.status(204).send();
    } catch (err) {
      if (err instanceof KeywordV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
