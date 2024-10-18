<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import { formatDate } from "../../utils/formatDate";
const props = defineProps(["journal"]);
const name = ref(props.journal.name);
const privacy = ref(props.journal.privacy);
const emit = defineEmits(["editJournal", "refreshJournals"]);

const editJournal = async (name: string, privacy: boolean) => {
  try {
    await fetchy(`/api/journals/${props.journal._id}`, "PATCH", { body: { name, privacy } });
  } catch (e) {
    return;
  }
  emit("editJournal");
  emit("refreshJournals");
};
</script>

<template>
  <form @submit.prevent="editJournal(name, privacy)">
    <p class="author">{{ props.journal.author }}</p>
    <textarea id="name" v-model="name" placeholder="Create a journal!" required> </textarea>
    <div class="base">
      <menu>
        <li><button class="btn-small pure-button-primary pure-button" type="submit">Save</button></li>
        <li><button class="btn-small pure-button" @click="emit('editJournal')">Cancel</button></li>
      </menu>
      <p v-if="props.journal.dateCreated !== props.journal.dateUpdated" class="timestamp">Edited on: {{ formatDate(props.journal.dateUpdated) }}</p>
      <p v-else class="timestamp">Created on: {{ formatDate(props.journal.dateCreated) }}</p>
    </div>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  border-radius: 4px;
  resize: none;
}

p {
  margin: 0em;
}

.author {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}
</style>
