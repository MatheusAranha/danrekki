import { JutsuElement } from '../../jutsu-v1/core/types';

export { JutsuElement };

export interface ICharacterV1Dto {
  _id: string;
  name: string;
  user_id: string;
  clan_id: string;
  available_dt: number;
  elemental_releases: JutsuElement[];
  created_at: string;
  updated_at: string;
}
