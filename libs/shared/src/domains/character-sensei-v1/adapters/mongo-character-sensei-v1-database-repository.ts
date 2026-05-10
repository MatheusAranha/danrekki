import { Collection, Db } from 'mongodb';
import { CharacterSenseiV1DatabaseRepository } from '../core/database-repository';
import { ICharacterSenseiV1Dto } from '../core/types';

type CharacterSenseiDoc = Omit<ICharacterSenseiV1Dto, '_id'> & { _id: string };

export class MongoCharacterSenseiV1DatabaseRepository extends CharacterSenseiV1DatabaseRepository {
  private readonly collection: Collection<CharacterSenseiDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<CharacterSenseiDoc>('character_senseis');
  }

  async findById(id: string): Promise<ICharacterSenseiV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as ICharacterSenseiV1Dto) : null;
  }

  async findByCharacterId(characterId: string): Promise<ICharacterSenseiV1Dto[]> {
    const docs = await this.collection.find({ character_id: characterId } as never).toArray();
    return docs as unknown as ICharacterSenseiV1Dto[];
  }

  async findByCharacterAndSensei(characterId: string, senseiId: string): Promise<ICharacterSenseiV1Dto | null> {
    const doc = await this.collection.findOne({ character_id: characterId, sensei_id: senseiId } as never);
    return doc ? (doc as unknown as ICharacterSenseiV1Dto) : null;
  }

  async save(dto: ICharacterSenseiV1Dto): Promise<ICharacterSenseiV1Dto> {
    await this.collection.insertOne(dto as unknown as CharacterSenseiDoc);
    return dto;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as never);
    return result.deletedCount === 1;
  }
}
