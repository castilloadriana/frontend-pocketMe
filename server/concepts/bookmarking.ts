import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";



export interface BookmarkDoc extends BaseDoc {
  author: ObjectId;
  items: Array<ObjectId>; //other posts are in an array of ids, we would have to search id to find the post 

}

/**
 * concept: Bookmarking [Item]
 */
export default class BookmarkingConcept{
  public readonly bookmarks: DocCollection<BookmarkDoc>;

  /**
   * Make an instance of Bookmarking.
   */
  constructor(collectionName: string) {
    this.bookmarks = new DocCollection<BookmarkDoc>(collectionName);
  }

  async create(author: ObjectId ) {
    const _id = await this.bookmarks.createOne({ author, items:[]});
    return { msg: "Bookmarks Folder Created!"};
  }


  async getBookmarks() {
    // Returns all Journals! You might want to page for better client performance
   return await this.bookmarks.readMany({}, { sort: { _id: -1 } });
  }

  async getByAuthor(author: ObjectId) {
    return await this.bookmarks.readMany({ author });
  }


// first check if the user has already created a bookmark if yes then proceed to add to the array 
  async addToBookmarks(author: ObjectId, item: ObjectId, ) {
    let bookmarkdoc = await this.bookmarks.readOne({author}); 
    if (bookmarkdoc === null) {
         //throw new NotFoundError("No bookmarks folder yet, will create one "); 
         //attempted to do something like Bookmarking.create(user) but not sure how 
      bookmarkdoc = await this.create( author );
      await this.bookmarks.partialUpdateOne({ }, {items: bookmarkdoc.items.concat(item)});
      return { msg: "Post has been bookmarked!" };

     }else{
      await this.bookmarks.partialUpdateOne({ }, {items: bookmarkdoc.items.concat(item)});
      return { msg: "Post has been bookmarked!" };
     }
  }
     
  

  async delete(author: ObjectId, item: ObjectId) {
    const bookmarkdoc = await this.bookmarks.readOne({author});
    if (bookmarkdoc === null) {
        throw new NotFoundError("No bookmarks yet");
    }
    const index = bookmarkdoc.items.indexOf(item);
        if (index > -1) {
            bookmarkdoc.items.splice(index, 1); //removes only the item we want 
        }
    return { msg: "Unbookmarked" };
  }

  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const bookmark = await this.bookmarks.readOne({ _id });
    if (!bookmark) {
      throw new NotFoundError(`Bookmark ${_id} does not exist!`);
    }
    if (bookmark.author.toString() !== user.toString()) {
      throw new BookmarkAuthorNotMatchError(user, _id);
    }
  }

}

export class BookmarkAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the creator of bookmark {1}!", author, _id);
  }
}
