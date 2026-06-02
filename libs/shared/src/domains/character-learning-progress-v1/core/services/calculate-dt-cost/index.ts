import { IClanV1DtModifier } from '../../../../clan-v1/core/types';

export function calculateDtCost(
  baseDtCost: number,
  clanModifiers: IClanV1DtModifier[],
  characterKeywordIds: string[],
): number {
  const applicable = clanModifiers.filter((m) => characterKeywordIds.includes(m.keyword_id));
  if (applicable.length === 0) return baseDtCost;
  const bestMultiplier = Math.min(...applicable.map((m) => m.multiplier));
  return Math.ceil(baseDtCost * bestMultiplier);
}
