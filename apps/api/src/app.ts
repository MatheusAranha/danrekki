import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import createHttpError, { isHttpError } from 'http-errors';
import { Db } from 'mongodb';
import { ForbiddenError, UnauthorizedError, RepositorySession } from '@danrekki/shared';

import { authenticate, requireAdmin } from './middleware/auth.middleware';
import { JwtTokenService } from './infrastructure/jwt-token-service';
import { getMongoClient } from './database/mongodb';
import { config } from './config';

import { MongoClanV1DatabaseRepository } from '@danrekki/shared/domains/clan-v1/adapters/mongo-clan-v1-database-repository';
import { registerClanV1Routes } from '@danrekki/shared/domains/clan-v1/adapters/express-clan-v1.controller';
import { CreateClanV1UseCase } from '@danrekki/shared/domains/clan-v1/core/use-cases/create';
import { GetClanV1UseCase } from '@danrekki/shared/domains/clan-v1/core/use-cases/get';
import { ListClansV1UseCase } from '@danrekki/shared/domains/clan-v1/core/use-cases/list';
import { UpdateClanV1UseCase } from '@danrekki/shared/domains/clan-v1/core/use-cases/update';
import { DeleteClanV1UseCase } from '@danrekki/shared/domains/clan-v1/core/use-cases/delete';

import { MongoReleaseV1DatabaseRepository } from '@danrekki/shared/domains/release-v1/adapters/mongo-release-v1-database-repository';
import { registerReleaseV1Routes } from '@danrekki/shared/domains/release-v1/adapters/express-release-v1.controller';
import { CreateReleaseV1UseCase } from '@danrekki/shared/domains/release-v1/core/use-cases/create';
import { GetReleaseV1UseCase } from '@danrekki/shared/domains/release-v1/core/use-cases/get';
import { ListReleasesV1UseCase } from '@danrekki/shared/domains/release-v1/core/use-cases/list';
import { UpdateReleaseV1UseCase } from '@danrekki/shared/domains/release-v1/core/use-cases/update';
import { DeleteReleaseV1UseCase } from '@danrekki/shared/domains/release-v1/core/use-cases/delete';

import { MongoJutsuRankV1DatabaseRepository } from '@danrekki/shared/domains/jutsu-rank-v1/adapters/mongo-jutsu-rank-v1-database-repository';
import { registerJutsuRankV1Routes } from '@danrekki/shared/domains/jutsu-rank-v1/adapters/express-jutsu-rank-v1.controller';
import { CreateJutsuRankV1UseCase } from '@danrekki/shared/domains/jutsu-rank-v1/core/use-cases/create';
import { GetJutsuRankV1UseCase } from '@danrekki/shared/domains/jutsu-rank-v1/core/use-cases/get';
import { ListJutsuRanksV1UseCase } from '@danrekki/shared/domains/jutsu-rank-v1/core/use-cases/list';
import { UpdateJutsuRankV1UseCase } from '@danrekki/shared/domains/jutsu-rank-v1/core/use-cases/update';
import { DeleteJutsuRankV1UseCase } from '@danrekki/shared/domains/jutsu-rank-v1/core/use-cases/delete';

import { MongoNinjaRankV1DatabaseRepository } from '@danrekki/shared/domains/ninja-rank-v1/adapters/mongo-ninja-rank-v1-database-repository';
import { registerNinjaRankV1Routes } from '@danrekki/shared/domains/ninja-rank-v1/adapters/express-ninja-rank-v1.controller';
import { CreateNinjaRankV1UseCase } from '@danrekki/shared/domains/ninja-rank-v1/core/use-cases/create';
import { GetNinjaRankV1UseCase } from '@danrekki/shared/domains/ninja-rank-v1/core/use-cases/get';
import { ListNinjaRanksV1UseCase } from '@danrekki/shared/domains/ninja-rank-v1/core/use-cases/list';
import { UpdateNinjaRankV1UseCase } from '@danrekki/shared/domains/ninja-rank-v1/core/use-cases/update';
import { DeleteNinjaRankV1UseCase } from '@danrekki/shared/domains/ninja-rank-v1/core/use-cases/delete';

import { MongoJutsuV1DatabaseRepository } from '@danrekki/shared/domains/jutsu-v1/adapters/mongo-jutsu-v1-database-repository';
import { registerJutsuV1Routes } from '@danrekki/shared/domains/jutsu-v1/adapters/express-jutsu-v1.controller';
import { CreateJutsuV1UseCase } from '@danrekki/shared/domains/jutsu-v1/core/use-cases/create';
import { GetJutsuV1UseCase } from '@danrekki/shared/domains/jutsu-v1/core/use-cases/get';
import { ListJutsusV1UseCase } from '@danrekki/shared/domains/jutsu-v1/core/use-cases/list';
import { UpdateJutsuV1UseCase } from '@danrekki/shared/domains/jutsu-v1/core/use-cases/update';
import { DeleteJutsuV1UseCase } from '@danrekki/shared/domains/jutsu-v1/core/use-cases/delete';

import { MongoUserV1DatabaseRepository } from '@danrekki/shared/domains/user-v1/adapters/mongo-user-v1-database-repository';
import { registerUserV1Routes } from '@danrekki/shared/domains/user-v1/adapters/express-user-v1.controller';
import { CreateUserV1UseCase } from '@danrekki/shared/domains/user-v1/core/use-cases/create';
import { LoginUserV1UseCase } from '@danrekki/shared/domains/user-v1/core/use-cases/login';
import { GetUserV1UseCase } from '@danrekki/shared/domains/user-v1/core/use-cases/get';
import { ListUsersV1UseCase } from '@danrekki/shared/domains/user-v1/core/use-cases/list';
import { UpdateUserV1UseCase } from '@danrekki/shared/domains/user-v1/core/use-cases/update';
import { DeleteUserV1UseCase } from '@danrekki/shared/domains/user-v1/core/use-cases/delete';

import { MongoCharacterV1DatabaseRepository } from '@danrekki/shared/domains/character-v1/adapters/mongo-character-v1-database-repository';
import { registerCharacterV1Routes } from '@danrekki/shared/domains/character-v1/adapters/express-character-v1.controller';
import { CreateCharacterV1UseCase } from '@danrekki/shared/domains/character-v1/core/use-cases/create';
import { GetCharacterV1UseCase } from '@danrekki/shared/domains/character-v1/core/use-cases/get';
import { ListCharactersV1UseCase } from '@danrekki/shared/domains/character-v1/core/use-cases/list';
import { UpdateCharacterV1UseCase } from '@danrekki/shared/domains/character-v1/core/use-cases/update';
import { DeleteCharacterV1UseCase } from '@danrekki/shared/domains/character-v1/core/use-cases/delete';

import { MongoCharacterReleaseV1DatabaseRepository } from '@danrekki/shared/domains/character-release-v1/adapters/mongo-character-release-v1-database-repository';
import { registerCharacterReleaseV1Routes } from '@danrekki/shared/domains/character-release-v1/adapters/express-character-release-v1.controller';
import { AssignCharacterReleaseV1UseCase } from '@danrekki/shared/domains/character-release-v1/core/use-cases/assign';
import { RevokeCharacterReleaseV1UseCase } from '@danrekki/shared/domains/character-release-v1/core/use-cases/revoke';
import { ListByCharacterCharacterReleaseV1UseCase as ListCharacterReleasesV1UseCase } from '@danrekki/shared/domains/character-release-v1/core/use-cases/list-by-character';

import { MongoLibraryV1DatabaseRepository } from '@danrekki/shared/domains/library-v1/adapters/mongo-library-v1-database-repository';
import { registerLibraryV1Routes } from '@danrekki/shared/domains/library-v1/adapters/express-library-v1.controller';
import { CreateLibraryV1UseCase } from '@danrekki/shared/domains/library-v1/core/use-cases/create';
import { GetLibraryV1UseCase } from '@danrekki/shared/domains/library-v1/core/use-cases/get';
import { ListLibrariesV1UseCase } from '@danrekki/shared/domains/library-v1/core/use-cases/list';
import { UpdateLibraryV1UseCase } from '@danrekki/shared/domains/library-v1/core/use-cases/update';
import { DeleteLibraryV1UseCase } from '@danrekki/shared/domains/library-v1/core/use-cases/delete';

import { MongoLibraryScrollV1DatabaseRepository } from '@danrekki/shared/domains/library-scroll-v1/adapters/mongo-library-scroll-v1-database-repository';
import { registerLibraryScrollV1Routes } from '@danrekki/shared/domains/library-scroll-v1/adapters/express-library-scroll-v1.controller';
import { CreateLibraryScrollV1UseCase } from '@danrekki/shared/domains/library-scroll-v1/core/use-cases/create';
import { GetLibraryScrollV1UseCase } from '@danrekki/shared/domains/library-scroll-v1/core/use-cases/get';
import { ListLibraryScrollsByLibraryV1UseCase } from '@danrekki/shared/domains/library-scroll-v1/core/use-cases/list-by-library';
import { UpdateLibraryScrollV1UseCase } from '@danrekki/shared/domains/library-scroll-v1/core/use-cases/update';
import { DeleteLibraryScrollV1UseCase } from '@danrekki/shared/domains/library-scroll-v1/core/use-cases/delete';

import { MongoSenseiV1DatabaseRepository } from '@danrekki/shared/domains/sensei-v1/adapters/mongo-sensei-v1-database-repository';
import { registerSenseiV1Routes } from '@danrekki/shared/domains/sensei-v1/adapters/express-sensei-v1.controller';
import { CreateSenseiV1UseCase } from '@danrekki/shared/domains/sensei-v1/core/use-cases/create';
import { GetSenseiV1UseCase } from '@danrekki/shared/domains/sensei-v1/core/use-cases/get';
import { ListSenseiV1UseCase } from '@danrekki/shared/domains/sensei-v1/core/use-cases/list';
import { UpdateSenseiV1UseCase } from '@danrekki/shared/domains/sensei-v1/core/use-cases/update';
import { DeleteSenseiV1UseCase } from '@danrekki/shared/domains/sensei-v1/core/use-cases/delete';

import { MongoTrainableContentV1DatabaseRepository } from '@danrekki/shared/domains/trainable-content-v1/adapters/mongo-trainable-content-v1-database-repository';
import { registerTrainableContentV1Routes } from '@danrekki/shared/domains/trainable-content-v1/adapters/express-trainable-content-v1.controller';
import { CreateTrainableContentV1UseCase } from '@danrekki/shared/domains/trainable-content-v1/core/use-cases/create';
import { GetTrainableContentV1UseCase } from '@danrekki/shared/domains/trainable-content-v1/core/use-cases/get';
import { ListTrainableContentV1UseCase } from '@danrekki/shared/domains/trainable-content-v1/core/use-cases/list';
import { UpdateTrainableContentV1UseCase } from '@danrekki/shared/domains/trainable-content-v1/core/use-cases/update';
import { DeleteTrainableContentV1UseCase } from '@danrekki/shared/domains/trainable-content-v1/core/use-cases/delete';

import { MongoSenseiContentV1DatabaseRepository } from '@danrekki/shared/domains/sensei-content-v1/adapters/mongo-sensei-content-v1-database-repository';
import { registerSenseiContentV1Routes } from '@danrekki/shared/domains/sensei-content-v1/adapters/express-sensei-content-v1.controller';
import { AssignSenseiContentV1UseCase } from '@danrekki/shared/domains/sensei-content-v1/core/use-cases/assign';
import { GetSenseiContentV1UseCase } from '@danrekki/shared/domains/sensei-content-v1/core/use-cases/get';
import { ListBySenseiSenseiContentV1UseCase } from '@danrekki/shared/domains/sensei-content-v1/core/use-cases/list-by-sensei';
import { UpdateSenseiContentV1UseCase } from '@danrekki/shared/domains/sensei-content-v1/core/use-cases/update';
import { DeleteSenseiContentV1UseCase } from '@danrekki/shared/domains/sensei-content-v1/core/use-cases/delete';

import { MongoCharacterLibraryV1DatabaseRepository } from '@danrekki/shared/domains/character-library-v1/adapters/mongo-character-library-v1-database-repository';
import { registerCharacterLibraryV1Routes } from '@danrekki/shared/domains/character-library-v1/adapters/express-character-library-v1.controller';
import { AssignCharacterLibraryV1UseCase } from '@danrekki/shared/domains/character-library-v1/core/use-cases/assign';
import { GetCharacterLibraryV1UseCase } from '@danrekki/shared/domains/character-library-v1/core/use-cases/get';
import { ListByCharacterCharacterLibraryV1UseCase } from '@danrekki/shared/domains/character-library-v1/core/use-cases/list-by-character';
import { DeleteCharacterLibraryV1UseCase } from '@danrekki/shared/domains/character-library-v1/core/use-cases/delete';

import { MongoCharacterSenseiV1DatabaseRepository } from '@danrekki/shared/domains/character-sensei-v1/adapters/mongo-character-sensei-v1-database-repository';
import { registerCharacterSenseiV1Routes } from '@danrekki/shared/domains/character-sensei-v1/adapters/express-character-sensei-v1.controller';
import { AssignCharacterSenseiV1UseCase } from '@danrekki/shared/domains/character-sensei-v1/core/use-cases/assign';
import { GetCharacterSenseiV1UseCase } from '@danrekki/shared/domains/character-sensei-v1/core/use-cases/get';
import { ListByCharacterCharacterSenseiV1UseCase } from '@danrekki/shared/domains/character-sensei-v1/core/use-cases/list-by-character';
import { DeleteCharacterSenseiV1UseCase } from '@danrekki/shared/domains/character-sensei-v1/core/use-cases/delete';

import { MongoDtTransactionV1DatabaseRepository } from '@danrekki/shared/domains/dt-transaction-v1/adapters/mongo-dt-transaction-v1-database-repository';
import { registerDtTransactionV1Routes } from '@danrekki/shared/domains/dt-transaction-v1/adapters/express-dt-transaction-v1.controller';
import { AddDtTransactionV1UseCase } from '@danrekki/shared/domains/dt-transaction-v1/core/use-cases/add';
import { ListByCharacterDtTransactionV1UseCase } from '@danrekki/shared/domains/dt-transaction-v1/core/use-cases/list-by-character';

import { MongoCharacterLearningProgressV1DatabaseRepository } from '@danrekki/shared/domains/character-learning-progress-v1/adapters/mongo-character-learning-progress-v1-database-repository';
import { registerCharacterLearningProgressV1Routes } from '@danrekki/shared/domains/character-learning-progress-v1/adapters/express-character-learning-progress-v1.controller';
import { StartLearningV1UseCase } from '@danrekki/shared/domains/character-learning-progress-v1/core/use-cases/start-learning';
import { InvestDtV1UseCase } from '@danrekki/shared/domains/character-learning-progress-v1/core/use-cases/invest-dt';
import { GetCharacterLearningProgressV1UseCase } from '@danrekki/shared/domains/character-learning-progress-v1/core/use-cases/get';
import { ListByCharacterLearningProgressV1UseCase } from '@danrekki/shared/domains/character-learning-progress-v1/core/use-cases/list-by-character';

export function createApp(db: Db) {
  const app = express();
  const { jwtSecret, jwtExpiresIn } = config();
  const tokenService = new JwtTokenService(jwtSecret, jwtExpiresIn);

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // — Users: /auth/* is public, /users/* requires admin —
  app.use('/users', authenticate, requireAdmin);
  const userRepo = new MongoUserV1DatabaseRepository(db);
  registerUserV1Routes(app, {
    createUser: new CreateUserV1UseCase(userRepo),
    loginUser: new LoginUserV1UseCase(userRepo, tokenService),
    getUser: new GetUserV1UseCase(userRepo),
    listUsers: new ListUsersV1UseCase(userRepo),
    updateUser: new UpdateUserV1UseCase(userRepo),
    deleteUser: new DeleteUserV1UseCase(userRepo),
  });

  // — Reference data (admin-write, public-read) —
  const clanRepo = new MongoClanV1DatabaseRepository(db);
  registerClanV1Routes(app, {
    createClan: new CreateClanV1UseCase(clanRepo),
    getClan: new GetClanV1UseCase(clanRepo),
    listClans: new ListClansV1UseCase(clanRepo),
    updateClan: new UpdateClanV1UseCase(clanRepo),
    deleteClan: new DeleteClanV1UseCase(clanRepo),
  });

  const releaseRepo = new MongoReleaseV1DatabaseRepository(db);
  registerReleaseV1Routes(app, {
    createRelease: new CreateReleaseV1UseCase(releaseRepo),
    getRelease: new GetReleaseV1UseCase(releaseRepo),
    listReleases: new ListReleasesV1UseCase(releaseRepo),
    updateRelease: new UpdateReleaseV1UseCase(releaseRepo),
    deleteRelease: new DeleteReleaseV1UseCase(releaseRepo),
  });

  const jutsuRankRepo = new MongoJutsuRankV1DatabaseRepository(db);
  registerJutsuRankV1Routes(app, {
    createJutsuRank: new CreateJutsuRankV1UseCase(jutsuRankRepo),
    getJutsuRank: new GetJutsuRankV1UseCase(jutsuRankRepo),
    listJutsuRanks: new ListJutsuRanksV1UseCase(jutsuRankRepo),
    updateJutsuRank: new UpdateJutsuRankV1UseCase(jutsuRankRepo),
    deleteJutsuRank: new DeleteJutsuRankV1UseCase(jutsuRankRepo),
  });

  const ninjaRankRepo = new MongoNinjaRankV1DatabaseRepository(db);
  registerNinjaRankV1Routes(app, {
    createNinjaRank: new CreateNinjaRankV1UseCase(ninjaRankRepo),
    getNinjaRank: new GetNinjaRankV1UseCase(ninjaRankRepo),
    listNinjaRanks: new ListNinjaRanksV1UseCase(ninjaRankRepo),
    updateNinjaRank: new UpdateNinjaRankV1UseCase(ninjaRankRepo),
    deleteNinjaRank: new DeleteNinjaRankV1UseCase(ninjaRankRepo),
  });

  const jutsuRepo = new MongoJutsuV1DatabaseRepository(db);
  registerJutsuV1Routes(app, {
    createJutsu: new CreateJutsuV1UseCase(jutsuRepo),
    getJutsu: new GetJutsuV1UseCase(jutsuRepo),
    listJutsus: new ListJutsusV1UseCase(jutsuRepo),
    updateJutsu: new UpdateJutsuV1UseCase(jutsuRepo),
    deleteJutsu: new DeleteJutsuV1UseCase(jutsuRepo),
  });

  // — Characters —
  const characterRepo = new MongoCharacterV1DatabaseRepository(db);
  registerCharacterV1Routes(app, {
    createCharacter: new CreateCharacterV1UseCase(characterRepo),
    getCharacter: new GetCharacterV1UseCase(characterRepo),
    listCharacters: new ListCharactersV1UseCase(characterRepo),
    updateCharacter: new UpdateCharacterV1UseCase(characterRepo),
    deleteCharacter: new DeleteCharacterV1UseCase(characterRepo),
  });

  const characterReleaseRepo = new MongoCharacterReleaseV1DatabaseRepository(db);
  registerCharacterReleaseV1Routes(app, {
    assignRelease: new AssignCharacterReleaseV1UseCase(characterReleaseRepo, characterRepo, releaseRepo),
    revokeRelease: new RevokeCharacterReleaseV1UseCase(characterReleaseRepo),
    listCharacterReleases: new ListCharacterReleasesV1UseCase(characterReleaseRepo),
  });

  // — Libraries —
  const libraryRepo = new MongoLibraryV1DatabaseRepository(db);
  registerLibraryV1Routes(app, {
    createLibrary: new CreateLibraryV1UseCase(libraryRepo),
    getLibrary: new GetLibraryV1UseCase(libraryRepo),
    listLibraries: new ListLibrariesV1UseCase(libraryRepo),
    updateLibrary: new UpdateLibraryV1UseCase(libraryRepo),
    deleteLibrary: new DeleteLibraryV1UseCase(libraryRepo),
  });

  const libraryScrollRepo = new MongoLibraryScrollV1DatabaseRepository(db);
  registerLibraryScrollV1Routes(app, {
    createScroll: new CreateLibraryScrollV1UseCase(libraryScrollRepo, libraryRepo, jutsuRepo, ninjaRankRepo),
    getScroll: new GetLibraryScrollV1UseCase(libraryScrollRepo),
    listLibraryScrolls: new ListLibraryScrollsByLibraryV1UseCase(libraryScrollRepo),
    updateScroll: new UpdateLibraryScrollV1UseCase(libraryScrollRepo),
    deleteScroll: new DeleteLibraryScrollV1UseCase(libraryScrollRepo),
  });

  // — Senseis —
  const senseiRepo = new MongoSenseiV1DatabaseRepository(db);
  registerSenseiV1Routes(app, {
    createSensei: new CreateSenseiV1UseCase(senseiRepo),
    getSensei: new GetSenseiV1UseCase(senseiRepo),
    listSenseis: new ListSenseiV1UseCase(senseiRepo),
    updateSensei: new UpdateSenseiV1UseCase(senseiRepo),
    deleteSensei: new DeleteSenseiV1UseCase(senseiRepo),
  });

  // — Trainable Content —
  const trainableContentRepo = new MongoTrainableContentV1DatabaseRepository(db);
  registerTrainableContentV1Routes(app, {
    createContent: new CreateTrainableContentV1UseCase(trainableContentRepo, jutsuRepo),
    getContent: new GetTrainableContentV1UseCase(trainableContentRepo),
    listContents: new ListTrainableContentV1UseCase(trainableContentRepo),
    updateContent: new UpdateTrainableContentV1UseCase(trainableContentRepo),
    deleteContent: new DeleteTrainableContentV1UseCase(trainableContentRepo),
  });

  const senseiContentRepo = new MongoSenseiContentV1DatabaseRepository(db);
  registerSenseiContentV1Routes(app, {
    assignContent: new AssignSenseiContentV1UseCase(senseiContentRepo, senseiRepo, trainableContentRepo),
    getSenseiContent: new GetSenseiContentV1UseCase(senseiContentRepo),
    listSenseiContents: new ListBySenseiSenseiContentV1UseCase(senseiContentRepo),
    updateSenseiContent: new UpdateSenseiContentV1UseCase(senseiContentRepo),
    deleteSenseiContent: new DeleteSenseiContentV1UseCase(senseiContentRepo),
  });

  // — Character Access —
  const characterLibraryRepo = new MongoCharacterLibraryV1DatabaseRepository(db);
  registerCharacterLibraryV1Routes(app, {
    assignLibrary: new AssignCharacterLibraryV1UseCase(characterLibraryRepo, characterRepo, libraryRepo, ninjaRankRepo),
    getCharacterLibrary: new GetCharacterLibraryV1UseCase(characterLibraryRepo),
    listCharacterLibraries: new ListByCharacterCharacterLibraryV1UseCase(characterLibraryRepo),
    deleteCharacterLibrary: new DeleteCharacterLibraryV1UseCase(characterLibraryRepo),
  });

  const characterSenseiRepo = new MongoCharacterSenseiV1DatabaseRepository(db);
  registerCharacterSenseiV1Routes(app, {
    assignSensei: new AssignCharacterSenseiV1UseCase(characterSenseiRepo, characterRepo, senseiRepo),
    getCharacterSensei: new GetCharacterSenseiV1UseCase(characterSenseiRepo),
    listCharacterSenseis: new ListByCharacterCharacterSenseiV1UseCase(characterSenseiRepo),
    deleteCharacterSensei: new DeleteCharacterSenseiV1UseCase(characterSenseiRepo),
  });

  // — Learning System —
  const sessionFactory = async () => getMongoClient().startSession() as unknown as RepositorySession;

  const dtTransactionRepo = new MongoDtTransactionV1DatabaseRepository(db);
  registerDtTransactionV1Routes(app, {
    addTransaction: new AddDtTransactionV1UseCase(dtTransactionRepo, characterRepo),
    listTransactions: new ListByCharacterDtTransactionV1UseCase(dtTransactionRepo),
  });

  const learningProgressRepo = new MongoCharacterLearningProgressV1DatabaseRepository(db);
  registerCharacterLearningProgressV1Routes(app, {
    startLearning: new StartLearningV1UseCase(
      learningProgressRepo,
      characterRepo,
      trainableContentRepo,
      clanRepo,
      characterReleaseRepo,
    ),
    investDt: new InvestDtV1UseCase(learningProgressRepo, characterRepo, dtTransactionRepo, sessionFactory),
    getProgress: new GetCharacterLearningProgressV1UseCase(learningProgressRepo),
    listProgress: new ListByCharacterLearningProgressV1UseCase(learningProgressRepo),
  });

  // — Global error handler —
  app.use((_req, _res, next) => next(createHttpError(404, 'Route not found')));

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ error: err.message });
      return;
    }
    if (err instanceof ForbiddenError) {
      res.status(403).json({ error: err.message });
      return;
    }
    if (isHttpError(err)) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
