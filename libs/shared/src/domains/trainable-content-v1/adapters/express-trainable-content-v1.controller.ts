import { Express } from 'express';
import createHttpError from 'http-errors';
import { CreateTrainableContentV1UseCase } from '../core/use-cases/create';
import { GetTrainableContentV1UseCase } from '../core/use-cases/get';
import { ListTrainableContentV1UseCase } from '../core/use-cases/list';
import { UpdateTrainableContentV1UseCase } from '../core/use-cases/update';
import { DeleteTrainableContentV1UseCase } from '../core/use-cases/delete';
import { TrainableContentV1NotFoundError } from '../core/errors';
import { JutsuV1NotFoundError } from '../../jutsu-v1/core/errors';

interface TrainableContentUseCases {
  createContent: CreateTrainableContentV1UseCase;
  getContent: GetTrainableContentV1UseCase;
  listContents: ListTrainableContentV1UseCase;
  updateContent: UpdateTrainableContentV1UseCase;
  deleteContent: DeleteTrainableContentV1UseCase;
}

export function registerTrainableContentV1Routes(app: Express, useCases: TrainableContentUseCases): void {
  app.get('/trainable-contents', async (_req, res, next) => {
    try {
      res.json(await useCases.listContents.execute());
    } catch (err) {
      next(err);
    }
  });

  app.post('/trainable-contents', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.createContent.execute(req.body));
    } catch (err) {
      if (err instanceof JutsuV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.get('/trainable-contents/:id', async (req, res, next) => {
    try {
      res.json(await useCases.getContent.execute({ id: req.params['id'] }));
    } catch (err) {
      if (err instanceof TrainableContentV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.patch('/trainable-contents/:id', async (req, res, next) => {
    try {
      res.json(await useCases.updateContent.execute({ id: req.params['id'], ...req.body }));
    } catch (err) {
      if (err instanceof TrainableContentV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.delete('/trainable-contents/:id', async (req, res, next) => {
    try {
      await useCases.deleteContent.execute({ id: req.params['id'] });
      res.status(204).send();
    } catch (err) {
      if (err instanceof TrainableContentV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
