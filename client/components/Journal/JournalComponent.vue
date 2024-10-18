<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["journal"]);
const emit = defineEmits(["editJournal", "refreshJournals"]);
const { currentUsername } = storeToRefs(useUserStore());

const deleteJournal = async () => {
  try {
    await fetchy(`/api/posts/${props.journal._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshJournals");
};
</script>

<template>
  <p class="author">{{ props.journal.author }}</p>
  <p>{{ props.journal.content }}</p>
  <div class="base">
    <menu v-if="props.journal.author == currentUsername">
      <li><button class="btn-small pure-button" @click="emit('editJournal', props.journal._id)">Edit</button></li>
      <li><button class="button-error btn-small pure-button" @click="deleteJournal">Delete</button></li>
    </menu>
    <article class="timestamp">
      <p v-if="props.journal.dateCreated !== props.journal.dateUpdated">Edited on: {{ formatDate(props.journal.dateUpdated) }}</p>
      <p v-else>Created on: {{ formatDate(props.journal.dateCreated) }}</p>
    </article>
  </div>
</template>

<style scoped>
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

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}
</style>
