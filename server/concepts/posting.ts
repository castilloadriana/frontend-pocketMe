import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";


/* export interface PostOptions {
  backgroundColor?: string;       //if I wanted to let users edit the background color of their 
} */

export interface PostDoc extends BaseDoc {
  author: ObjectId;
  content: string;
  folderid: ObjectId; //journalid
  // options?: PostOptions;
}

/**
 * concept: Posting [Author]
 */
export default class PostingConcept {
  public readonly posts: DocCollection<PostDoc>;

  /**
   * Make an instance of Posting.
   */
  constructor(collectionName: string) {
    this.posts = new DocCollection<PostDoc>(collectionName);
  }


  //should only be able to create a post if the journal already exists 
  async create(author: ObjectId, folderid: ObjectId, content: string) {
    const _id = await this.posts.createOne({ author, folderid, content });
    const post = await this.posts.readOne({ _id }); 
    return { msg: "Post successfully created!", post};
    
  }

  async getPosts() {
    // Returns all posts! You might want to page for better client performance
    return await this.posts.readMany({}, { sort: { _id: -1 } });
  }

  async getPostsfromJournal(author: ObjectId, folderid: ObjectId,) {
    // Returns posts from specific journal! You might want to page for better client performance
    return await this.posts.readMany({author, folderid}, { sort: { _id: -1 } });
  }

  async deletePosts(folderid: ObjectId) {
    // Deletes all posts from a specific folder! 
    return await this.posts.deleteMany({ folderid });
  }

  async getByAuthor(author: ObjectId) {
    return await this.posts.readMany({ author });
  }

  async update(_id: ObjectId, folderid?: ObjectId, content?: string) {
    // Note that if content or options is undefined, those fields will *not* be updated   //? is used when its optional to edit them
    // since undefined values for partialUpdateOne are ignored.
    await this.posts.partialUpdateOne({ _id }, { folderid, content });
    return { msg: "Post successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.posts.deleteOne({ _id });
    return { msg: "Post deleted successfully!" };
  }

  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const post = await this.posts.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Post ${_id} does not exist!`);
    }
    if (post.author.toString() !== user.toString()) {
      throw new PostAuthorNotMatchError(user, _id);
    }
  }
}

export class PostAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", author, _id);
  }
}
