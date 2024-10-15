import { Authing } from "./app";
import { AlreadyFriendsError, FriendNotFoundError, FriendRequestAlreadyExistsError, FriendRequestDoc, FriendRequestNotFoundError } from "./concepts/friending";
import { JournalDoc } from "./concepts/journaling";
import { HighlightDoc } from "./concepts/highlighting";
import { StickerDoc } from "./concepts/sticking";
import { BookmarkDoc } from "./concepts/bookmarking";
import { PostAuthorNotMatchError, PostDoc } from "./concepts/posting";
import { Router } from "./framework/router";

/**
 * This class does useful conversions for the frontend.
 * For example, it converts a {@link PostDoc} into a more readable format for the frontend.
 */
export default class Responses {
  /**
   * Convert PostDoc into more readable format for the frontend by converting the author id into a username.
   */
  static async post(post: PostDoc | null) {
    if (!post) {
      return post;
    }
    const author = await Authing.getUserById(post.author);
    return { ...post, author: author.username };
  }

  /**
   * Same as {@link post} but for an array of PostDoc for improved performance.
   */
  static async posts(posts: PostDoc[]) {
    const authors = await Authing.idsToUsernames(posts.map((post) => post.author));
    return posts.map((post, i) => ({ ...post, author: authors[i] }));
  }
  
  /**
   * Convert JournalDoc into more readable format for the frontend by converting the author id into a username.
   */
  static async journal(journal: JournalDoc | null) {
    if (!journal) {
      return journal;
    }
    const author = await Authing.getUserById(journal.author);
    return { ...journal, author: author.username };
  }

  /**
   * Same as {@link journal} but for an array of JournalDoc for improved performance.
   */
  static async journals(journals: JournalDoc[]) {
    const authors = await Authing.idsToUsernames(journals.map((journal) => journal.author));
    return journals.map((journal, i) => ({ ...journal, author: authors[i] }));
  }

    /**
   * Convert BookmarkDoc into more readable format for the frontend by converting the author id into a username.
   */
    static async bookmark(bookmark: BookmarkDoc | null) {
      if (!bookmark) {
        return bookmark;
      }
      const author = await Authing.getUserById(bookmark.author);
      return { ...bookmark, author: author.username };
    }
  
    /**
     * Same as {@link bookmark} but for an array of JournalDoc for improved performance.
     */
    static async bookmarks(bookmarks: BookmarkDoc[]) {
      const authors = await Authing.idsToUsernames(bookmarks.map((bookmark) => bookmark.author));
      return bookmarks.map((bookmark, i) => ({ ...bookmark, author: authors[i] }));
    }

  /**
   * Convert FriendRequestDoc into more readable format for the frontend
   * by converting the ids into usernames.
   */
  static async friendRequests(requests: FriendRequestDoc[]) {
    const from = requests.map((request) => request.from);
    const to = requests.map((request) => request.to);
    const usernames = await Authing.idsToUsernames(from.concat(to));
    return requests.map((request, i) => ({ ...request, from: usernames[i], to: usernames[i + requests.length] }));
  }
}

Router.registerError(PostAuthorNotMatchError, async (e) => {
  const username = (await Authing.getUserById(e.author)).username;
  return e.formatWith(username, e._id);
});

Router.registerError(FriendRequestAlreadyExistsError, async (e) => {
  const [user1, user2] = await Promise.all([Authing.getUserById(e.from), Authing.getUserById(e.to)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(FriendNotFoundError, async (e) => {
  const [user1, user2] = await Promise.all([Authing.getUserById(e.user1), Authing.getUserById(e.user2)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(FriendRequestNotFoundError, async (e) => {
  const [user1, user2] = await Promise.all([Authing.getUserById(e.from), Authing.getUserById(e.to)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(AlreadyFriendsError, async (e) => {
  const [user1, user2] = await Promise.all([Authing.getUserById(e.user1), Authing.getUserById(e.user2)]);
  return e.formatWith(user1.username, user2.username);
});


