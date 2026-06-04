import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Db } from 'mongodb';
import { MongoJutsuRankV1DatabaseRepository } from '@danrekki/shared/domains/jutsu-rank-v1/adapters/mongo-jutsu-rank-v1-database-repository';
import { MongoKeywordV1DatabaseRepository } from '@danrekki/shared/domains/release-v1/adapters/mongo-release-v1-database-repository';
import { MongoJutsuV1DatabaseRepository } from '@danrekki/shared/domains/jutsu-v1/adapters/mongo-jutsu-v1-database-repository';
import { JutsuElement } from '@danrekki/shared/domains/jutsu-v1/core/types';

// Stable, deterministic ID derived from a namespace prefix + a name.
function stableId(prefix: string, name: string): string {
  const hex = createHash('sha256').update(`${prefix}:${name.toLowerCase().trim()}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

// ── Jutsu ranks ──────────────────────────────────────────────────────────────

const JUTSU_RANKS = [
  { name: 'E-Rank', order: 1, dt_cost: 10 },
  { name: 'D-Rank', order: 2, dt_cost: 25 },
  { name: 'C-Rank', order: 3, dt_cost: 50 },
  { name: 'B-Rank', order: 4, dt_cost: 100 },
  { name: 'A-Rank', order: 5, dt_cost: 200 },
  { name: 'S-Rank', order: 6, dt_cost: 500 },
];

// ── Element mapping ──────────────────────────────────────────────────────────

const TYPE_TO_ELEMENTS: Record<string, JutsuElement[]> = {
  'Fire Release': ['katon'],
  'Water Release': ['suiton'],
  'Earth Release': ['doton'],
  'Wind Release': ['futon'],
  'Lightning Release': ['raiton'],
};

// ── Keyword normalization ────────────────────────────────────────────────────

const KEYWORD_FIXES: Record<string, string> = {
  'Bukijutus': 'Bukijutsu',
  'Fuinjutsul': 'Fuinjutsu',
};

function normalizeKeyword(raw: string): string {
  let k = raw.trim().replace(/\s*&[a-z]+;/gi, '').replace(/\.+$/, '').trim();
  return KEYWORD_FIXES[k] ?? k;
}

// ── TSV parsing ──────────────────────────────────────────────────────────────

interface TsvRow {
  name: string;
  jutsuType: string;
  rank: string;
  castingTime: string;
  range: string;
  duration: string;
  components: string;
  chakraCost: string;
  keywords: string[];
  description: string;
  atHigherRanks: string | null;
}

function parseTsv(): TsvRow[] {
  const tsvPath = resolve(__dirname, '../../../../../docs/jutsuList.tsv');
  const lines = readFileSync(tsvPath, 'utf-8').split('\n');
  const rows: TsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    const name = cols[0]?.trim();
    if (!name) continue;

    const rawKeywords = (cols[8] ?? '').split(',').map(normalizeKeyword).filter(Boolean);
    rows.push({
      name,
      jutsuType: cols[1]?.trim() ?? '',
      rank: cols[2]?.trim() ?? '',
      castingTime: cols[3]?.trim() ?? '1 Action',
      range: cols[4]?.trim() ?? 'Self',
      duration: cols[5]?.trim() ?? 'Instant',
      components: cols[6]?.trim() ?? '',
      chakraCost: cols[7]?.trim() ?? '',
      keywords: [...new Set(rawKeywords)],
      description: cols[9]?.trim() ?? '',
      atHigherRanks: cols[10]?.trim() || null,
    });
  }

  return rows;
}

// ── Main seeder ──────────────────────────────────────────────────────────────

export async function seedJutsus(db: Db): Promise<void> {
  const jutsuRankRepo = new MongoJutsuRankV1DatabaseRepository(db);
  const keywordRepo = new MongoKeywordV1DatabaseRepository(db);
  const jutsuRepo = new MongoJutsuV1DatabaseRepository(db);
  const now = new Date().toISOString();

  // 1. Seed jutsu ranks ──────────────────────────────────────────────────────
  const existingRankIds = new Set<string>((await db.collection('jutsu_ranks').distinct('_id')) as unknown as string[]);
  let ranksInserted = 0;

  const rankIdByName = new Map<string, string>();
  for (const rank of JUTSU_RANKS) {
    const id = stableId('jutsu_rank', rank.name);
    rankIdByName.set(rank.name, id);
    if (!existingRankIds.has(id)) {
      await jutsuRankRepo.save({ _id: id, name: rank.name, order: rank.order, dt_cost: rank.dt_cost, created_at: now, updated_at: now });
      ranksInserted++;
    }
  }
  console.log(`[jutsu-seeder] Jutsu ranks: ${ranksInserted} inserted, ${JUTSU_RANKS.length - ranksInserted} already exist.`);

  // 2. Seed keywords extracted from the TSV ─────────────────────────────────
  const rows = parseTsv();

  const allKeywordNames = new Set<string>();
  for (const row of rows) {
    for (const kw of row.keywords) allKeywordNames.add(kw);
  }

  const existingKeywordIds = new Set<string>((await db.collection('keywords').distinct('_id')) as unknown as string[]);
  let keywordsInserted = 0;

  const keywordIdByName = new Map<string, string>();
  for (const name of allKeywordNames) {
    const id = stableId('keyword', name);
    keywordIdByName.set(name, id);
    if (!existingKeywordIds.has(id)) {
      await keywordRepo.save({ _id: id, name, created_at: now, updated_at: now });
      keywordsInserted++;
    }
  }
  console.log(`[jutsu-seeder] Keywords: ${keywordsInserted} inserted, ${allKeywordNames.size - keywordsInserted} already exist.`);

  // 3. Seed jutsus ──────────────────────────────────────────────────────────
  const existingJutsuIds = new Set<string>((await db.collection('jutsus').distinct('_id')) as unknown as string[]);
  let jutsuInserted = 0;
  let jutsuSkipped = 0;

  for (const row of rows) {
    const id = stableId('jutsu', row.name);

    if (existingJutsuIds.has(id)) {
      jutsuSkipped++;
      continue;
    }

    const jutsuRankId = rankIdByName.get(row.rank);
    if (!jutsuRankId) {
      console.warn(`[jutsu-seeder] Unknown rank "${row.rank}" for jutsu "${row.name}", skipping.`);
      jutsuSkipped++;
      continue;
    }

    const keywordIds = row.keywords
      .map((kw) => keywordIdByName.get(kw))
      .filter((id): id is string => id !== undefined);

    const elements: JutsuElement[] = TYPE_TO_ELEMENTS[row.jutsuType] ?? [];

    await jutsuRepo.save({
      _id: id,
      name: row.name,
      jutsu_rank_id: jutsuRankId,
      keyword_ids: keywordIds,
      elements,
      casting_time: row.castingTime,
      range: row.range,
      chakra_cost: row.chakraCost,
      components: row.components,
      duration: row.duration,
      description: row.description,
      at_higher_ranks: row.atHigherRanks,
      created_at: now,
      updated_at: now,
    });

    jutsuInserted++;
  }

  console.log(`[jutsu-seeder] Jutsus: ${jutsuInserted} inserted, ${jutsuSkipped} already exist or skipped.`);
}
