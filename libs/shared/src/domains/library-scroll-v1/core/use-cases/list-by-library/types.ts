import { ILibraryScrollV1Dto } from '../../types';

export interface IListLibraryScrollsByLibraryV1UseCaseInputDto {
  library_id: string;
}

export type IListLibraryScrollsByLibraryV1UseCaseOutputDto = ILibraryScrollV1Dto[];
