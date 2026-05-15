import { Express } from 'express';
import createHttpError from 'http-errors';
import { AddDtTransactionV1UseCase } from '../core/use-cases/add';
import { ListByCharacterDtTransactionV1UseCase } from '../core/use-cases/list-by-character';
import { CharacterV1NotFoundError } from '../../character-v1/core/errors';

interface DtTransactionUseCases {
  addTransaction: AddDtTransactionV1UseCase;
  listTransactions: ListByCharacterDtTransactionV1UseCase;
}

export function registerDtTransactionV1Routes(app: Express, useCases: DtTransactionUseCases): void {
  app.post('/characters/:characterId/dt-transactions', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.addTransaction.execute({
        character_id: req.params['characterId'],
        ...req.body,
      }));
    } catch (err) {
      if (err instanceof CharacterV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.get('/characters/:characterId/dt-transactions', async (req, res, next) => {
    try {
      res.json(await useCases.listTransactions.execute({ character_id: req.params['characterId'] }));
    } catch (err) {
      next(err);
    }
  });
}
