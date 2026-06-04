import { Db } from 'mongodb';
import { MongoJutsuRankV1DatabaseRepository } from '@danrekki/shared/domains/jutsu-rank-v1/adapters/mongo-jutsu-rank-v1-database-repository';
import { MongoKeywordV1DatabaseRepository } from '@danrekki/shared/domains/release-v1/adapters/mongo-release-v1-database-repository';
import { MongoJutsuV1DatabaseRepository } from '@danrekki/shared/domains/jutsu-v1/adapters/mongo-jutsu-v1-database-repository';
import { SEED_JUTSU_RANKS, SEED_KEYWORDS, SEED_JUTSUS } from './jutsu-seed-data';

export async function seedJutsus(db: Db): Promise<void> {
  const jutsuRankRepo = new MongoJutsuRankV1DatabaseRepository(db);
  const keywordRepo = new MongoKeywordV1DatabaseRepository(db);
  const jutsuRepo = new MongoJutsuV1DatabaseRepository(db);

  // Bulk-fetch existing IDs once per collection to avoid N individual queries.
  const existingRankIds = new Set<string>((await db.collection('jutsu_ranks').distinct('_id')) as unknown as string[]);
  const existingKeywordIds = new Set<string>((await db.collection('keywords').distinct('_id')) as unknown as string[]);
  const existingJutsuIds = new Set<string>((await db.collection('jutsus').distinct('_id')) as unknown as string[]);

  // Ranks
  let ranksInserted = 0;
  for (const rank of SEED_JUTSU_RANKS) {
    if (!existingRankIds.has(rank._id)) {
      await jutsuRankRepo.save(rank);
      ranksInserted++;
    }
  }
  console.log(`[jutsu-seeder] Ranks: ${ranksInserted} inserted, ${SEED_JUTSU_RANKS.length - ranksInserted} already exist.`);

  // Keywords
  let keywordsInserted = 0;
  for (const keyword of SEED_KEYWORDS) {
    if (!existingKeywordIds.has(keyword._id)) {
      await keywordRepo.save(keyword);
      keywordsInserted++;
    }
  }
  console.log(`[jutsu-seeder] Keywords: ${keywordsInserted} inserted, ${SEED_KEYWORDS.length - keywordsInserted} already exist.`);

  // Jutsus
  let jutsuInserted = 0;
  for (const jutsu of SEED_JUTSUS) {
    if (!existingJutsuIds.has(jutsu._id)) {
      await jutsuRepo.save(jutsu);
      jutsuInserted++;
    }
  }
  console.log(`[jutsu-seeder] Jutsus: ${jutsuInserted} inserted, ${SEED_JUTSUS.length - jutsuInserted} already exist.`);
}
