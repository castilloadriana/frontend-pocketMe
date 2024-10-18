<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const name = ref("");
const privacy = ref(true); // Initially set to true (private)
const emit = defineEmits(["refreshJournals"]);

const createJournal = async (name: string, privacy: boolean) => {
  try {
    await fetchy("/api/journals", "POST", {
      body: { name, privacy },
    });
  } catch (_) {
    return;
  }
  emit("refreshJournals");
  emptyForm();
};

const emptyForm = () => {
  name.value = "";
  privacy.value = true; // Reset privacy to true after form submission
};
</script>

<template>
  <form @submit.prevent="createJournal(name, privacy)">
    <label for="name">Journal Name:</label>
    <textarea
      id="name"
      v-model="name"
      placeholder="Name your journal!"
      required
    ></textarea>

    <label for="privacy">Private:</label>
    <!-- Custom switch for privacy toggle -->
    <label class="switch">
      <input type="checkbox" v-model="privacy" />
      <span class="slider round"></span>
    </label>
    <span>{{ privacy ? "Private" : "Public" }}</span>

    <button type="submit" class="pure-button-primary pure-button">
      Create Journal
    </button>
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

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  margin-left: 0.5em;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196f3;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

span {
  margin-left: 0.5em;
  font-weight: bold;
}
</style>
