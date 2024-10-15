import AuthenticatingConcept from "./concepts/authenticating";
import FriendingConcept from "./concepts/friending";
import PostingConcept from "./concepts/posting";
import SessioningConcept from "./concepts/sessioning";
import JournalingConcept from "./concepts/journaling";
import HighlightingConcept from "./concepts/highlighting";
import StickingConcept from "./concepts/sticking";
import BookmarkingConcept from "./concepts/bookmarking";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Posting = new PostingConcept("posts");
export const Friending = new FriendingConcept("friends");
export const Journaling = new JournalingConcept("journals");
export const Highlighting = new HighlightingConcept("highlights");
export const Sticking = new StickingConcept("stickers");
export const Bookmarking = new BookmarkingConcept("bookmarks");