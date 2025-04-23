<template>
    <div class="landing-page">
      <h1>Welcome to the Pathfinder Attack Calculator</h1>
      <button @click="startNew">🎲 Start a New Character</button>
      <button @click="promptLoad">📂 Load Existing Profile</button>
  
      <div v-if="showMenu" class="load-menu">
        <h3>Select a profile:</h3>
        <ul>
          <li v-for="name in profiles" :key="name">
            <button @click="selectProfile(name)">{{ name }}</button>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup>
  /* global defineEmits */
  import { ref } from 'vue';
  import { getSavedProfileNames } from './AttackManagerScript.js';
  
  // Declare emitted events for Vue 3 <script setup>
  const emit = defineEmits(['start-new', 'load-profile']);
  
  // Local reactive state
  const showMenu = ref(false);
  const profiles = ref([]);
  
  // Handler: start new character
  function startNew() {
    emit('start-new');
  }
  
  // Handler: load menu toggle and fetch names
  function promptLoad() {
    profiles.value = getSavedProfileNames();
    showMenu.value = true;
  }
  
  // Handler: select and emit a profile name
  function selectProfile(name) {
    emit('load-profile', name);
  }
  </script>
  
  <style scoped>
  .landing-page {
    text-align: center;
    margin-top: 60px;
    padding: 20px;
  }
  .landing-page button {
    display: block;
    margin: 12px auto;
    padding: 10px 24px;
    font-size: 1.1rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
  }
  .landing-page button:hover {
    background-color: #eaeaea;
  }
  .load-menu {
    margin-top: 24px;
  }
  .load-menu ul {
    list-style: none;
    padding: 0;
  }
  .load-menu li button {
    padding: 8px 16px;
    margin: 6px 0;
    width: 200px;
  }
  </style>
  