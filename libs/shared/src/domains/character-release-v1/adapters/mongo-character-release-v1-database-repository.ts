import { Collection, Db } from 'mongodb';
import { CharacterKeywordV1DatabaseRepository } from '../core/database-repository';
import { ICharacterKeywordV1Dto } from '../core/types';

type CharacterReleaseDoc = Omit<ICharacterKeywordV1Dto, '_id'> & { _id: string };

export class MongoCharacterKeywordV1DatabaseRepository extends CharacterKeywordV1DatabaseRepository {
  private readonly collection: Collection<CharacterReleaseDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<CharacterReleaseDoc>('character_keywords');
  }

  async findById(id: string): Promise<ICharacterKeywordV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as ICharacterKeywordV1Dto) : null;
  }

  async findByCharacterId(characterId: string): Promise<ICharacterKeywordV1Dto[]> {
    const docs = await this.collection.find({ character_id: characterId } as never).toArray();
    return docs as unknown as ICharacterKeywordV1Dto[];
  }

  async findByCharacterAndKeyword(characterId: string, releaseId: string): Promise<ICharacterKeywordV1Dto | null> {
    const doc = await this.collection.findOne({ character_id: characterId, keyword_id: releaseId } as never);
    return doc ? (doc as unknown as ICharacterKeywordV1Dto) : null;
  }

  async save(dto: ICharacterKeywordV1Dto): Promise<ICharacterKeywordV1Dto> {
    await this.collection.insertOne(dto as unknown as CharacterReleaseDoc);
    return dto;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as never);
    return result.deletedCount === 1;
  }
}
