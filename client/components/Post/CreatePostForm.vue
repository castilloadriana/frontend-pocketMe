<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";


const content = ref("");
const journalFolder = ref("");
const emit = defineEmits(["refreshPosts"]);
let searchAuthor = ref("");
let journals = ref<Array<Record<string, string>>>([]);
const loaded = ref(false);
const { currentUsername } = storeToRefs(useUserStore());


const createPost = async (journalFolder: string, content: string) => {
  try {
    // Ensure a journal folder is selected before creating the post
    if (!journalFolder) {
      alert("Please select a journal to post to.");
      return;
    }

    // Call the POST API to create the post with the selected journal ID
    await fetchy("/api/posts", "POST", {
      body: { journalid: journalFolder ,  content},
    });
  } catch (_) {
    return;
  }
  emit("refreshPosts");
  emptyForm();
};

async function getJournals(author: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let journalResults;
  try {
    journalResults = await fetchy("/api/journals", "GET", { query });
  } catch (_) {
    return;
  }
  searchAuthor.value = author ? author : "";
  journals.value = journalResults;
}

const emptyForm = () => {
  content.value = "";
};

onBeforeMount(async () => {
  await getJournals(currentUsername.value);
  loaded.value = true;
});
</script>

<template>
  <form @submit.prevent="createPost(journalFolder, content)">
    <label for="content">Post Contents:</label>
    <textarea id="content" v-model="content" placeholder="Create a post!" required> </textarea>

    <!-- Dropdown for selecting a journal -->
    <label for="journalFolder">Post to Journal:</label>
    <select id="journalFolder" v-model="journalFolder" required>
      <option value="" disabled>Select a journal</option>
      <option v-for="journal in journals" :key="journal._id" :value="journal._id">{{ journal.name }}</option>
    </select>

    <button type="submit" class="pure-button-primary pure-button">Create Post</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
