<script setup lang="ts">
import CreateJournalForm from "@/components/Journal/CreateJournalForm.vue";
import JournalComponent from "@/components/Journal/JournalComponent.vue";
import EditJournalForm from "@/components/Journal/EditJournalForm.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import SearchJournalForm from "./SearchJournalForm.vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let journals = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");

async function getJournals(author?: string) {
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

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getJournals();
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn">
    <h2>Create a journal:</h2>
    <CreateJournalForm @refreshJournals="getJournals" />
  </section>
  <div class="row">
    <h2 v-if="!searchAuthor">Journals:</h2>
    <h2 v-else>Journals by {{ searchAuthor }}:</h2>
    <!-- <SearchJournalForm @getJournalsByAuthor="getJournals" /> -->
  </div>
  <section class="journals" v-if="loaded && journals.length !== 0">
    <article v-for="journal in journals" :key="journal._id">
      <JournalComponent v-if="editing !== journal._id" :journal="journal" @refreshJournals="getJournals" @editJournal="updateEditing" />
      <EditJournalForm v-else :journal="journal" @refreshJournals="getJournals" @editJournal="updateEditing" />
    </article>
  </section>
  <p v-else-if="loaded">No journals found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
