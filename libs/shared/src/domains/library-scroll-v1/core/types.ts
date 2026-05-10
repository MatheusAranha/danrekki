export interface ILibraryScrollV1Dto {
  _id: string;
  library_id: string;
  jutsu_id: string;
  required_ninja_rank_id: string;
  rented_by_character_id: string | null;
  rented_at: string | null;
  created_at: string;
  updated_at: string;
}
