import { Collection, Db } from 'mongodb';
import { CharacterReleaseV1DatabaseRepository } from '../core/database-repository';
import { ICharacterReleaseV1Dto } from '../core/types';

type CharacterReleaseDoc = Omit<ICharacterReleaseV1Dto, '_id'> & { _id: string };

export class MongoCharacterReleaseV1DatabaseRepository extends CharacterReleaseV1DatabaseRepository {
  private readonly collection: Collection<CharacterReleaseDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<CharacterReleaseDoc>('character_releases');
  }

  async findById(id: string): Promise<ICharacterReleaseV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as ICharacterReleaseV1Dto) : null;
  }

  async findByCharacterId(characterId: string): Promise<ICharacterReleaseV1Dto[]> {
    const docs = await this.collection.find({ character_id: characterId } as never).toArray();
    return docs as unknown as ICharacterReleaseV1Dto[];
  }

  async findByCharacterAndRelease(characterId: string, releaseId: string): Promise<ICharacterReleaseV1Dto | null> {
    const doc = await this.collection.findOne({ character_id: characterId, release_id: releaseId } as never);
    return doc ? (doc as unknown as ICharacterReleaseV1Dto) : null;
  }

  async save(dto: ICharacterReleaseV1Dto): Promise<ICharacterReleaseV1Dto> {
    await this.collection.insertOne(dto as unknown as CharacterReleaseDoc);
    return dto;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as never);
    return result.deletedCount === 1;
  }
}
