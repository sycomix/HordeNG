import {Credentials} from "../../types/credentials/credentials";
import {Resolvable} from "../../helper/resolvable";
import {StoredImage, UnsavedStoredImage} from "../../types/db/stored-image";
import {PaginatedResult} from "../../types/paginated-result";

export interface DataStorage<TCredentials extends Credentials> {
  get name(): string;
  get displayName(): Resolvable<string>;
  validateCredentials(credentials: TCredentials): Promise<boolean | string>;
  storeImage(image: UnsavedStoredImage): Promise<void>;
  loadImages(page: number, perPage: number): Promise<PaginatedResult<StoredImage>>;
  deleteImage(image: StoredImage): Promise<void>;
  storeOption(option: string, value: any): Promise<void>;
  getOption<T>(option: string, defaultValue: T): Promise<T>;
  getOption<T>(option: string): Promise<T | undefined>;
}