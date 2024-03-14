import {DataStorage} from "./data-storage";
import {Injectable} from "@angular/core";
import {Credentials} from "../../types/credentials/credentials";
import {TranslatorService} from "../translator.service";
import {Resolvable} from "../../helper/resolvable";
import {StoredImage, UnsavedStoredImage} from "../../types/db/stored-image";
import {DatabaseService} from "../database.service";
import {PaginatedResult} from "../../types/paginated-result";
import {Order} from "../../types/order";

@Injectable({
  providedIn: 'root',
})
export class IndexedDbDataStorage implements DataStorage<Credentials> {
  constructor(
    private readonly translator: TranslatorService,
    private readonly database: DatabaseService,
  ) {
  }

  public getOption<T>(option: string, defaultValue: T): Promise<T>;
  public getOption<T>(option: string): Promise<T | undefined>;
  public async getOption<T>(option: string, defaultValue?: T): Promise<T | undefined> {
    const value = await this.database.getSetting<T>(option);
    if (value === undefined) {
      return defaultValue;
    }

    return value.value;
  }

  public async storeOption(option: string, value: any): Promise<void> {
    return await this.database.setSetting({
      setting: option,
      value: value,
    });
  }

  public async deleteImage(image: StoredImage): Promise<void> {
    await this.database.deleteImage(image);
  }

  public loadImages(page: number, perPage: number): Promise<PaginatedResult<StoredImage>> {
    return this.database.getImages(page, perPage, Order.Desc);
  }

  public get displayName(): Resolvable<string> {
    return this.translator.get('app.storage.browser');
  }

  public get name(): string {
    return 'indexed_db';
  }

  public async validateCredentials(credentials: Credentials): Promise<true> {
    return true;
  }

  public async storeImage(image: UnsavedStoredImage): Promise<void> {
    delete image.id;
    await this.database.storeImage(image);
  }
}