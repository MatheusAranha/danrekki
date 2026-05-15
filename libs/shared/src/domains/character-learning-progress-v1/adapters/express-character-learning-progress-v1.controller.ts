import { Express } from 'express';
import createHttpError from 'http-errors';
import { StartLearningV1UseCase } from '../core/use-cases/start-learning';
import { InvestDtV1UseCase } from '../core/use-cases/invest-dt';
import { GetCharacterLearningProgressV1UseCase } from '../core/use-cases/get';
import { ListByCharacterLearningProgressV1UseCase } from '../core/use-cases/list-by-character';
import {
  LearningProgressV1NotFoundError,
  LearningProgressV1AlreadyExistsError,
  LearningProgressV1AlreadyCompletedError,
  InsufficientDtError,
} from '../core/errors';
import { CharacterV1NotFoundError } from '../../character-v1/core/errors';
import { TrainableContentV1NotFoundError } from '../../trainable-content-v1/core/errors';

interface LearningProgressUseCases {
  startLearning: StartLearningV1UseCase;
  investDt: InvestDtV1UseCase;
  getProgress: GetCharacterLearningProgressV1UseCase;
  listProgress: ListByCharacterLearningProgressV1UseCase;
}

export function registerCharacterLearningProgressV1Routes(app: Express, useCases: LearningProgressUseCases): void {
  app.get('/characters/:characterId/learning-progress', async (req, res, next) => {
    try {
      res.json(await useCases.listProgress.execute({ character_id: req.params['characterId'] }));
    } catch (err) {
      next(err);
    }
  });

  app.post('/characters/:characterId/learning-progress', async (req, res, next) => {
    try {
      res.status(201).json(
        await useCases.startLearning.execute({
          character_id: req.params['characterId'],
          ...req.body,
        }),
      );
    } catch (err) {
      if (err instanceof CharacterV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof TrainableContentV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof LearningProgressV1AlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.get('/characters/:characterId/learning-progress/:progressId', async (req, res, next) => {
    try {
      res.json(await useCases.getProgress.execute({ id: req.params['progressId'] }));
    } catch (err) {
      if (err instanceof LearningProgressV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.post('/characters/:characterId/learning-progress/:progressId/invest', async (req, res, next) => {
    try {
      res.status(200).json(
        await useCases.investDt.execute({
          progress_id: req.params['progressId'],
          ...req.body,
        }),
      );
    } catch (err) {
      if (err instanceof LearningProgressV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof LearningProgressV1AlreadyCompletedError) return next(createHttpError(409, err.message));
      if (err instanceof InsufficientDtError) return next(createHttpError(422, err.message));
      if (err instanceof CharacterV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
