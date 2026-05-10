import { Express } from 'express';
import createHttpError from 'http-errors';
import { AssignSenseiContentV1UseCase } from '../core/use-cases/assign';
import { GetSenseiContentV1UseCase } from '../core/use-cases/get';
import { ListBySenseiSenseiContentV1UseCase } from '../core/use-cases/list-by-sensei';
import { UpdateSenseiContentV1UseCase } from '../core/use-cases/update';
import { DeleteSenseiContentV1UseCase } from '../core/use-cases/delete';
import { SenseiContentV1NotFoundError, SenseiContentV1AlreadyAssignedError } from '../core/errors';
import { SenseiV1NotFoundError } from '../../sensei-v1/core/errors';
import { TrainableContentV1NotFoundError } from '../../trainable-content-v1/core/errors';

interface SenseiContentUseCases {
  assignContent: AssignSenseiContentV1UseCase;
  getSenseiContent: GetSenseiContentV1UseCase;
  listSenseiContents: ListBySenseiSenseiContentV1UseCase;
  updateSenseiContent: UpdateSenseiContentV1UseCase;
  deleteSenseiContent: DeleteSenseiContentV1UseCase;
}

export function registerSenseiContentV1Routes(app: Express, useCases: SenseiContentUseCases): void {
  app.get('/senseis/:senseiId/contents', async (req, res, next) => {
    try {
      res.json(await useCases.listSenseiContents.execute({ sensei_id: req.params['senseiId'] }));
    } catch (err) {
      next(err);
    }
  });

  app.post('/senseis/:senseiId/contents', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.assignContent.execute({
        sensei_id: req.params['senseiId'],
        ...req.body,
      }));
    } catch (err) {
      if (err instanceof SenseiV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof TrainableContentV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof SenseiContentV1AlreadyAssignedError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.get('/senseis/:senseiId/contents/:contentAssignmentId', async (req, res, next) => {
    try {
      res.json(await useCases.getSenseiContent.execute({ id: req.params['contentAssignmentId'] }));
    } catch (err) {
      if (err instanceof SenseiContentV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.patch('/senseis/:senseiId/contents/:contentAssignmentId', async (req, res, next) => {
    try {
      res.json(await useCases.updateSenseiContent.execute({ id: req.params['contentAssignmentId'], ...req.body }));
    } catch (err) {
      if (err instanceof SenseiContentV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.delete('/senseis/:senseiId/contents/:contentAssignmentId', async (req, res, next) => {
    try {
      await useCases.deleteSenseiContent.execute({ id: req.params['contentAssignmentId'] });
      res.status(204).send();
    } catch (err) {
      if (err instanceof SenseiContentV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
