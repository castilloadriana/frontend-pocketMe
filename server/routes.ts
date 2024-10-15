import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Friending, Posting, Sessioning, Journaling, Highlighting, Sticking, Bookmarking } from "./app";
import { PostDoc } from "./concepts/posting";
import { SessionDoc } from "./concepts/sessioning";
import { JournalDoc } from "./concepts/journaling";
import { HighlightDoc } from "./concepts/highlighting";
import { StickerDoc } from "./concepts/sticking";
import { BookmarkDoc } from "./concepts/bookmarking";
import Responses from "./responses";

import { z } from "zod";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/:username")
  @Router.validate(z.object({ username: z.string().min(1) }))
  async getUser(username: string) {
    return await Authing.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }


/* 
Friends
 */

  @Router.get("/friends")
  async getFriends(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.idsToUsernames(await Friending.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: SessionDoc, friend: string) {
    const user = Sessioning.getUser(session);
    const friendOid = (await Authing.getUserByUsername(friend))._id;
    return await Friending.removeFriend(user, friendOid);
  }

  @Router.get("/friend/requests")
  async getRequests(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Responses.friendRequests(await Friending.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.sendRequest(user, toOid);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.removeRequest(user, toOid);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.acceptRequest(fromOid, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.rejectRequest(fromOid, user);
  }

/* 
Journals
 */

  @Router.post("/journals")
  async createJournal(session: SessionDoc, name: string, privacy: boolean) {
    const user = Sessioning.getUser(session);
    return Journaling.create(user, name, privacy);
  }

  @Router.patch("/journals/:id")
  async updateSettingsJournal(session: SessionDoc, id: string, name: string, privacy: boolean) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Journaling.assertAuthorIsUser(oid, user);
    return await Journaling.update(oid, name, privacy);
  }

  @Router.delete("/journals/:id")
  async deleteJournal(session: SessionDoc, journalid: string) {
    const user = Sessioning.getUser(session);
    const journaloid = new ObjectId(journalid);
    await Posting.assertAuthorIsUser(journaloid, user);
    await Posting.deletePosts(journaloid); //deletes the posts inside the journal array 
    return Posting.delete(journaloid); //deletes de journal object
    
  }

  @Router.get("/journals") //get posts by author
  @Router.validate(z.object({ author: z.string().optional() }))
  async getJournals(author?: string) {
    let journals;
    if (author) {
      const id = (await Authing.getUserByUsername(author))._id;
      return journals = await Journaling.getByAuthor(id);
    } else {
      return journals = await Journaling.getJournals();
    }
    //return Responses.journals(journals);
  }

  // @Router.post("/journals/:journalid/posts/:postid") 
  // async addJournalToPost(session:SessionDoc, journalid: string, postid: string) {
  //   const user = Sessioning.getUser(session);
  //   const journalOid = new ObjectId(journalid);
  //   // assertCreatorIsUser was not implemented in recitaiton so I'm leaving it commented out in the solutions
  //   // in order to not throw any errors, but in reality, we should assert that the current logged in
  //   // user is the creator of the label before allowing the user to affix the label to an item. 
  //   // await Labeling.assertCreatorIsUser(labelOid, user);   
  //   const postOid = new ObjectId(postid);
  //   await Posting.assertAuthorIsUser(postOid, user);
  //   return Journaling.addToJournal(journalOid, postOid);
  // }


/* 
Posts
 */

@Router.get("/posts") //get posts by author
@Router.validate(z.object({ author: z.string().optional() }))
async getPosts(author?: string) {
  let posts;
  if (author) {
    const id = (await Authing.getUserByUsername(author))._id;
    posts = await Posting.getByAuthor(id);
  } else {
    posts = await Posting.getPosts();
  }
  return Responses.posts(posts);
}

//will only let the user post if the journal has already been created, needs to check if the jhournal already exists
@Router.post("/posts") 
async createPost(session: SessionDoc, journalid: string, content: string) {   //question
  const user = Sessioning.getUser(session);

  const journalOid = new ObjectId(journalid);

  const created = await Posting.create(user, journalOid, content);

  //this part adds the post to the journal array
  if (!created.post) {
    throw new Error("Post creation failed"); // Handle null post case
  }
  const postOid = created.post._id; // Extract the _id from created.post

  console.log('post ID:', postOid);

  await Posting.assertAuthorIsUser(postOid, user);
  await Journaling.addToJournal(journalOid, postOid); //adds post to array of posts 

  return { msg: created.msg, post: await Responses.post(created.post) };
}

@Router.patch("/posts/:id")
async updatePost(session: SessionDoc, id: string, parentid?: string, content?: string) {
  const user = Sessioning.getUser(session);
  const oid = new ObjectId(id);
  const parentOid = new ObjectId(parentid);
  await Posting.assertAuthorIsUser(oid, user);
  return await Posting.update(oid, parentOid, content);
}

@Router.delete("/posts/:id")
async deletePost(session: SessionDoc, id: string) {
  const user = Sessioning.getUser(session);
  const oid = new ObjectId(id);
  await Posting.assertAuthorIsUser(oid, user);
  return Posting.delete(oid);
}



/* 
Highlights
 */
  @Router.post("/highlights")
  async createHighlight(session: SessionDoc, postid: string, comment: string, quote?: string) {
    const user = Sessioning.getUser(session);
    const post0id = new ObjectId(postid);
    return Highlighting.create(user, post0id, comment, quote);
  }

  @Router.patch("/highlights/:id")
  async updateHighlight(session: SessionDoc, id: string, comment: string, quote?: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Highlighting.assertAuthorIsUser(oid, user);
    return await Highlighting.update(oid, comment, quote);
  }

  @Router.delete("/highlights/:id")
  async deleteHighlight(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return Posting.delete(oid);
  }

  @Router.get("/highlights") //get highlights by post
  async getHighlights(postid: string) {
    const Postoid = new ObjectId(postid);
    return await Highlighting.getByMedia(Postoid);
  }

/* 
Stickies
 */
@Router.post("/stickers")
async createSticker(session: SessionDoc, postid: string, sticker: string) {
  const user = Sessioning.getUser(session);
  const post0id = new ObjectId(postid);
  return Sticking.create(user, post0id, sticker);
}

@Router.patch("/stickers/:id")
async updateSticker(session: SessionDoc, id: string, sticker: string) {
  const user = Sessioning.getUser(session);
  const oid = new ObjectId(id);
  await Sticking.assertAuthorIsUser(oid, user);
  return await Sticking.update(oid, sticker);
}

@Router.delete("/stickers/:id")
async deleteSticker(session: SessionDoc, postid: string) {
  const user = Sessioning.getUser(session);
  const oid = new ObjectId(postid);
  await Sticking.assertAuthorIsUser(oid, user);
  return Sticking.delete(oid);
}


/* 
Bookmarks
 */

@Router.post("/bookmarks")
async addBookmark(session: SessionDoc, postid: string) {
  const user = Sessioning.getUser(session);
  const post0id = new ObjectId(postid);

  //has to check if they even have bookmarks yet or else it creates the bookmark folder
  const bookmarkFolder = await Bookmarking.getByAuthor(user);
  if (!bookmarkFolder) {
    await Bookmarking.create(user);
  }
  return Bookmarking.addToBookmarks(user, post0id);
}

@Router.get("/bookmarks") //get bookmarks by author
@Router.validate(z.object({ author: z.string().optional() }))
async getBookmarks(author?: string) {
  let bookmarks;
  if (author) {
    const id = (await Authing.getUserByUsername(author))._id;
    bookmarks = await Bookmarking.getByAuthor(id);
  } else {
    bookmarks = await Bookmarking.getBookmarks();
  }
  return Responses.bookmarks(bookmarks);
}

@Router.delete("/bookmarks/:id")
async removeBookmark(session: SessionDoc, postid: string) {
  const user = Sessioning.getUser(session);
  const post0id = new ObjectId(postid);
  return   await Bookmarking.delete(user, post0id);

}

}



/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
