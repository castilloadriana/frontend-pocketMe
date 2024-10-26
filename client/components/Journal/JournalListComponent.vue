<script setup lang="ts">
import CreateJournalForm from "@/components/Journal/CreateJournalForm.vue";
import JournalComponent from "@/components/Journal/JournalComponent.vue";
import EditJournalForm from "@/components/Journal/EditJournalForm.vue";
import ProfilePostListComponent from "@/components/Post/ProfilePostListComponent.vue";


import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { isLoggedIn } = storeToRefs(useUserStore());
const { currentUsername } = storeToRefs(useUserStore());

const loaded = ref(false);
let journals = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");
let selectedJournal = ref("");  // Track the selected journal ID

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

function handleJournalSelect(journalId: string) {
  selectedJournal.value = journalId;  // Update selected journal
}

function resetJournalSelection() {
  selectedJournal.value = "";  // Reset to show all journals
}

onBeforeMount(async () => {
  await getJournals(currentUsername.value);
  loaded.value = true;
});
</script>


<template>
  <!-- Show the journal list and create form if no journal is selected -->
  <section v-if="isLoggedIn && !selectedJournal">
    <h2>Create a journal:</h2>
    <CreateJournalForm @refreshJournals="getJournals" />
  </section>

  <!-- Journal list -->
  <section class="journals" v-if="loaded && journals.length !== 0 && !selectedJournal">
    <article v-for="journal in journals" :key="journal._id">
      <JournalComponent 
        v-if="editing !== journal._id" 
        :journal="journal" 
        @refreshJournals="getJournals" 
        @editJournal="updateEditing" 
        @openJournal="handleJournalSelect"
      />
      <EditJournalForm 
        v-else 
        :journal="journal" 
        @refreshJournals="getJournals" 
        @editJournal="updateEditing" 
      />
    </article>
  </section>
  
  <!-- Journal posts for the selected journal -->
  <section v-else-if="selectedJournal">
    <button @click="resetJournalSelection">Back to Journals</button>
    <h2>Posts for Journal {{ selectedJournal }}</h2>
    <!-- Add component to display posts related to selectedJournal -->
    <ProfilePostListComponent :journalId="selectedJournal" />
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
