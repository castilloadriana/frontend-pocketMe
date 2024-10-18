<script setup lang="ts">
import JournalListComponent from "@/components/Journal/JournalListComponent.vue";
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Journals</h1>
    <JournalListComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
