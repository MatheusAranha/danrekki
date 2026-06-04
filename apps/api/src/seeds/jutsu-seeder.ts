import { randomUUID } from 'crypto';
import { Db } from 'mongodb';
import { MongoJutsuRankV1DatabaseRepository } from '@danrekki/shared/domains/jutsu-rank-v1/adapters/mongo-jutsu-rank-v1-database-repository';
import { MongoKeywordV1DatabaseRepository } from '@danrekki/shared/domains/release-v1/adapters/mongo-release-v1-database-repository';
import { MongoJutsuV1DatabaseRepository } from '@danrekki/shared/domains/jutsu-v1/adapters/mongo-jutsu-v1-database-repository';
import { MongoTrainableContentV1DatabaseRepository } from '@danrekki/shared/domains/trainable-content-v1/adapters/mongo-trainable-content-v1-database-repository';
import { SEED_JUTSU_RANKS, SEED_KEYWORDS, SEED_JUTSUS } from './jutsu-seed-data';

export async function seedJutsus(db: Db): Promise<void> {
  const jutsuRankRepo = new MongoJutsuRankV1DatabaseRepository(db);
  const keywordRepo = new MongoKeywordV1DatabaseRepository(db);
  const jutsuRepo = new MongoJutsuV1DatabaseRepository(db);
  const contentRepo = new MongoTrainableContentV1DatabaseRepository(db);
  const now = new Date().toISOString();

  // Bulk-fetch existing IDs once per collection to avoid N individual queries.
  const existingRankIds = new Set<string>((await db.collection('jutsu_ranks').distinct('_id')) as unknown as string[]);
  const existingKeywordIds = new Set<string>((await db.collection('keywords').distinct('_id')) as unknown as string[]);
  const existingJutsuIds = new Set<string>((await db.collection('jutsus').distinct('_id')) as unknown as string[]);
  const existingContentJutsuIds = new Set<string>(
    (await db.collection('trainable_contents').distinct('jutsu_id')) as unknown as string[]
  );

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

  // Jutsus + trainable content backfill
  const rankDtCost = new Map(SEED_JUTSU_RANKS.map((r) => [r._id, r.dt_cost]));
  let jutsuInserted = 0;
  let contentInserted = 0;
  let contentUpdated = 0;

  for (const jutsu of SEED_JUTSUS) {
    if (!existingJutsuIds.has(jutsu._id)) {
      await jutsuRepo.save(jutsu);
      jutsuInserted++;
    }

    const expectedDtCost = rankDtCost.get(jutsu.jutsu_rank_id) ?? 0;

    if (!existingContentJutsuIds.has(jutsu._id)) {
      await contentRepo.save({
        _id: randomUUID(),
        type: 'jutsu',
        jutsu_id: jutsu._id,
        name: jutsu.name,
        description: jutsu.description,
        base_dt_cost: expectedDtCost,
        created_at: now,
        updated_at: now,
      });
      contentInserted++;
    } else {
      const existing = await contentRepo.findByJutsuId(jutsu._id);
      if (existing && existing.base_dt_cost !== expectedDtCost) {
        await contentRepo.update(existing._id, { base_dt_cost: expectedDtCost, updated_at: now });
        contentUpdated++;
      }
    }
  }

  console.log(`[jutsu-seeder] Jutsus: ${jutsuInserted} inserted, ${SEED_JUTSUS.length - jutsuInserted} already exist.`);
  console.log(`[jutsu-seeder] Trainable contents: ${contentInserted} backfilled, ${contentUpdated} updated.`);
}
