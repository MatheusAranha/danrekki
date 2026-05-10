import { Express } from 'express';
import createHttpError from 'http-errors';
import { CreateUserV1UseCase } from '../core/use-cases/create';
import { LoginUserV1UseCase } from '../core/use-cases/login';
import { GetUserV1UseCase } from '../core/use-cases/get';
import { ListUsersV1UseCase } from '../core/use-cases/list';
import { UpdateUserV1UseCase } from '../core/use-cases/update';
import { DeleteUserV1UseCase } from '../core/use-cases/delete';
import {
  UserV1NotFoundError,
  UserV1EmailAlreadyExistsError,
  InvalidCredentialsError,
} from '../core/errors';

export function registerUserV1Routes(
  app: Express,
  useCases: {
    createUser: CreateUserV1UseCase;
    loginUser: LoginUserV1UseCase;
    getUser: GetUserV1UseCase;
    listUsers: ListUsersV1UseCase;
    updateUser: UpdateUserV1UseCase;
    deleteUser: DeleteUserV1UseCase;
  },
): void {
  app.post('/auth/login', async (req, res, next) => {
    try {
      const result = await useCases.loginUser.execute(req.body);
      res.json(result);
    } catch (err) {
      if (err instanceof InvalidCredentialsError) return next(createHttpError(401, err.message));
      next(err);
    }
  });

  app.get('/users', async (_req, res, next) => {
    try {
      res.json(await useCases.listUsers.execute());
    } catch (err) {
      next(err);
    }
  });

  app.post('/users', async (req, res, next) => {
    try {
      res.status(201).json(await useCases.createUser.execute(req.body));
    } catch (err) {
      if (err instanceof UserV1EmailAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.get('/users/:id', async (req, res, next) => {
    try {
      res.json(await useCases.getUser.execute({ id: req.params['id'] }));
    } catch (err) {
      if (err instanceof UserV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });

  app.patch('/users/:id', async (req, res, next) => {
    try {
      res.json(await useCases.updateUser.execute({ id: req.params['id'], ...req.body }));
    } catch (err) {
      if (err instanceof UserV1NotFoundError) return next(createHttpError(404, err.message));
      if (err instanceof UserV1EmailAlreadyExistsError) return next(createHttpError(409, err.message));
      next(err);
    }
  });

  app.delete('/users/:id', async (req, res, next) => {
    try {
      await useCases.deleteUser.execute({ id: req.params['id'] });
      res.status(204).send();
    } catch (err) {
      if (err instanceof UserV1NotFoundError) return next(createHttpError(404, err.message));
      next(err);
    }
  });
}
