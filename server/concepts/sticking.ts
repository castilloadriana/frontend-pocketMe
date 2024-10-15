import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";



export interface StickerDoc extends BaseDoc {
  author: ObjectId;
  media: ObjectId;
  sticker: string; 

}

/**
 * concept: Sticking [Post]
 */
export default class StickingConcept {
  public readonly stickers: DocCollection<StickerDoc>;

  /**
   * Make an instance of Sticking.
   */
  constructor(collectionName: string) {
    this.stickers = new DocCollection<StickerDoc>(collectionName);
  }

  async create(author:ObjectId, media: ObjectId, sticker: string ) {
    const _id = await this.stickers.createOne({ author, media, sticker});
    return { msg: "Sticker successfully created!", sticker: await this.stickers.readOne({ _id }) };
  }

  async getByMedia( media: ObjectId) {
    //Gets all the highlights made on one post 
    return await this.stickers.readMany({ media});
  }

  async update(_id: ObjectId, sticker: string ) {
    // Note that if content or options is undefined, those fields will *not* be updated
    // since undefined values for partialUpdateOne are ignored.
    await this.stickers.partialUpdateOne({ _id }, {sticker });
    return { msg: "Sticker successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.stickers.deleteOne({ _id });
    return { msg: "Sticker deleted successfully!" };
  }
  
  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const highlight = await this.stickers.readOne({ _id });
    if (!highlight) {
      throw new NotFoundError(`Highlight ${_id} does not exist!`);
    }
    if (highlight.author.toString() !== user.toString()) {
      throw new HighlightAuthorNotMatchError(user, _id);
    }
  }

}

export class HighlightAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of highlight {1}!", author, _id);
  }
}
