<template>
    <div class="mypage">
      <h1>Pathfinder Attack Calculator</h1>

      <div style="margin-bottom: 20px;">
        <input v-model="profileName" placeholder="Profile name" />
        <button @click="saveCurrentProfile">💾 Save Profile</button>
        <button @click="openProfileLoadMenu">📂 Load Profile</button>
      </div>

      <div class="input-group">
        <label for="hpCurrent">Current HP:</label>
        <input id="hpCurrent" type="number" v-model.number="character.hpCurrent" />
        
        <label for="hpMax">Max HP:</label>
        <input id="hpMax" type="number" v-model.number="character.hpMax" />
      </div>

      <div class="input-group">
        <label for="armorClass">AC:</label>
        <input id="armorClass" type="number" v-model.number="character.armorClass" />
      </div>

  
      <div class="input-group">
        <label for="bab">BAB:</label>
        <input id="bab" type="number" v-model.number="character.bab" />
      </div>
  
      <div class="input-group">
        <label for="strength">Str:</label>
        <input id="strength" type="number" v-model.number="character.strength" />
      </div>
  
      <div class="output-group">
        <p><strong>BAB:</strong> {{ character.bab }}</p>
        <p><strong>Strength Modifier:</strong> {{ strengthMod }}</p>
      </div>

      <div v-if="showProfileLoadMenu">
        <h3>Select a profile:</h3>
        <ul>
          <li v-for="name in savedProfiles" :key="name">
            <button @click="loadSelectedProfile(name)">{{ name }}</button>
          </li>
        </ul>
      </div>

  
      <hr />
  
      <h2>Attacks</h2>
  
      <div
        v-for="(attack, index) in character.attacks"
        :key="index"
        class="attack-entry"
        :class="{ editing: attack.editing }"
      >
        <div class="attack-header">
          <h3>{{ attack.name || 'New Attack' }}</h3>
          <button class="edit-button" @click="editAttack(index, character)">✏️ Edit</button>
          <button @click="deleteAttack(index, character)">🗑️ Delete</button>
        </div>
  
        <div v-if="attack.editing" class="attack-fields">
          <label>
            Name:
            <input v-model="attack.name" />
          </label>
  
          <div class="row-group">
            <label>
              Dice:
              <select v-model="attack.die">
                <option v-for="die in availableDice" :key="die">{{ die }}</option>
              </select>
            </label>
  
            <label class="count-short">
              Count:
              <input type="number" v-model.number="attack.count" min="1" />
            </label>
            <label class="count-short">
              Crit Floor:
              <input type="number" v-model.number="attack.critRange" min="1" max="20" />
            </label>
            <label>
              Reach:
              <select v-model.number="attack.reach">
                <option v-for="r in [5, 10, 15, 20, 25, 30]" :key="r" :value="r">
                  {{ r }} ft
                </option>
              </select>
            </label>
          </div>

  
          <label>
            Material:
            <select v-model="attack.material">
              <option disabled value="">Select Material</option>
              <option>Basic</option>
              <option>Silver</option>
              <option>Cold Iron</option>
              <option>Adamantine</option>
            </select>
          </label>
  
          <div class="damage-types">
            <p>Damage Types:</p>
            <label><input type="checkbox" v-model="attack.slashing" /> Slashing</label>
            <label><input type="checkbox" v-model="attack.piercing" /> Piercing</label>
            <label><input type="checkbox" v-model="attack.blunt" /> Bludgeoning</label>
          </div>
  
          <div class="combat-flags">
            <label>
              <input type="checkbox" :checked="attack.primary" @change="togglePrimary(attack)" />
              Primary Attack
            </label>
            <label>
              <input type="checkbox" :checked="attack.secondary" @change="toggleSecondary(attack)" />
              Secondary Attack
            </label>
            <label><input type="checkbox" v-model="attack.twoHanded" /> Two-Handed</label>
            <label><input type="checkbox" v-model="attack.magical" /> Magical</label>
          </div>
  
  
          <div class="extra-damage-section">
            <h4>Extra Damage</h4>
            <button @click="addExtraDamage(attack)">➕ Add Extra Damage</button>
  
            <div
              v-for="(bonus, i) in attack.extraDamage"
              :key="i"
              class="extra-damage"
            >
              <label>
                Type:
                <select v-model="bonus.type">
                  <option disabled value="">Choose type</option>
                  <option>Fire</option>
                  <option>Cold</option>
                  <option>Acid</option>
                  <option>Electric</option>
                </select>
              </label>
  
              <label>
                Dice:
                <select v-model="bonus.die">
                  <option v-for="die in availableDice" :key="die">{{ die }}</option>
                </select>
              </label>
  
              <label>
                Count:
                <input type="number" v-model.number="bonus.count" min="1" />
              </label>
            </div>
          </div>

          

          <label>
            Save Attack As:
            <input v-model="saveAttackName" placeholder="Attack name" />
          </label>
          <button
            @click="() => {
              saveAttack(index, saveAttackName);
              completeAttack(index, character);
              saveAttackName = '';
            }"
          >
            💾 Save & Complete
          </button>
          <button @click="completeAttack(index, character)">✅ Complete</button>
        </div>
  
        <div v-else class="attack-display">
          <p>
            <strong>Base Damage:</strong> {{ attack.count }}{{ attack.die }}
            + {{ calculateDamageBonus(attack, character.strength) }}
            ({{ displayDamageTypes(attack) }})
          </p>

          <p><strong>Attack Bonus:</strong>
            +{{
              // if we’ve rolled, use the BAB from that roll;
              // otherwise use the BAB we “loaded in” (fallback to character.bab if somehow missing)
              (attack.lastRoll
                ? attack.lastRoll.statsAtRoll.bab
                : attack.loadedBab ?? character.bab)
              + calculateDamageBonus(attack, character.strength)
            }}
          </p>
          <p><strong>Material:</strong> {{ attack.material || '—' }}</p>
          <p><strong>Reach:</strong> {{ attack.reach }} ft</p>

          <div v-if="attack.extraDamage.length">
            <p><strong>Extra Damage:</strong></p>
            <ul>
              <li
                v-for="(bonus, i) in attack.extraDamage"
                :key="i"
              >
                {{ bonus.count }}{{ bonus.die }} {{ bonus.type }}
              </li>
            </ul>
          </div>
  
          <hr />
  
          <hr />
  
          <div class="roll-section" v-if="attack.lastRoll">
            <p><strong>Last Roll (Using BAB {{ attack.lastRoll.statsAtRoll.bab }}, STR {{ attack.lastRoll.statsAtRoll.strength }})</strong></p>
  
            <p>
              <strong>Attack Roll:</strong>
              {{ attack.lastRoll.attack.total }}  
              <span>(d20: {{ attack.lastRoll.attack.raw }}, Bonus: {{ attack.lastRoll.attack.mod }})</span>
              <span v-if="attack.lastRoll.attack.isCrit">🔥 <strong>Crit!</strong></span>
            </p>

            <div v-if="attack.lastRoll.critConfirmation">
              <p><strong>Crit Confirmation:</strong>
                {{ attack.lastRoll.critConfirmation.total }}
                (d20: {{ attack.lastRoll.critConfirmation.raw }})
                <span v-if="attack.lastRoll.critConfirmation.confirmed">✅ Confirmed!</span>
                <span v-else>❌ Not confirmed</span>
              </p>

              <div v-if="attack.lastRoll.critConfirmation.confirmed">
                <p><strong>Critical Damage:</strong> {{ attack.lastRoll.critDamage.total }}
                  <span>(Rolls: [{{ attack.lastRoll.critDamage.rolls.join(', ') }}] + {{ attack.lastRoll.critDamage.bonus }})</span>
                </p>
                <p><strong>Total Damage:</strong>
                  {{ attack.lastRoll.baseDamage.total + attack.lastRoll.critDamage.total }}
                </p>
              </div>
            </div>

  
            <p>
              <strong>Base Damage:</strong> {{ attack.lastRoll.baseDamage.total }}
              <span>(Rolls: [{{ attack.lastRoll.baseDamage.rolls.join(', ') }}] + {{ attack.lastRoll.baseDamage.bonus }})</span>
            </p>
  
            <ul v-if="attack.lastRoll.extraDamage.length">
              <li v-for="(d, i) in attack.lastRoll.extraDamage" :key="i">
                {{ d.amount }} {{ d.type }}
                <span>({{ d.count }}{{ d.die }} = [{{ d.rolls.join(', ') }}])</span>
              </li>
            </ul>
  
            <button class="inline-roll-btn" @click="rollAttack(index)">🎲 Roll Again</button>
          </div>
          <div v-if="!attack.editing && !attack.lastRoll">
            <button class="inline-roll-btn" @click="rollAttack(index)">🎲 Roll</button>
          </div>
        </div>
      </div>
  
      <div style="margin-bottom: 20px;">
        <button class="add-button" @click="addAttack">➕ Add Attack</button>
        <button class="add-button" @click="openAttackLoadMenu">📂 Load Attack</button>
      </div>

      <div v-if="showAttackLoadMenu" style="margin-bottom: 20px;">
        <h3>Select a saved attack to load:</h3>
        <ul>
          <li v-for="name in savedAttackNames" :key="name">
            <button @click="loadAttackByName(name)">{{ name }}</button>
          </li>
        </ul>
      </div>
  
</div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';

  import {
    //Core State
    availableDice,

    //Attack Logic
    calculateDamageBonus,
    addAttack as addAttackUtil,
    addExtraDamage,
    completeAttack,
    editAttack,
    deleteAttack as deleteAttackUtil,
    rollAttack as rollAttackUtil,
    displayDamageTypes,

    //Exclusive Toggles
    togglePrimary,
    toggleSecondary,

    // Individual attack/profile save + load
    saveProfile,
    loadProfile,
    getSavedProfileNames,
    saveSingleAttack,
    loadSingleAttack,
    getSavedAttackNames

  } from './AttackManagerScript.js';

const savedAttackNames = ref([]);
const showAttackLoadMenu = ref(false);
const saveAttackName = ref('');

// Profile save/load UI state
const profileName = ref('');
const savedProfiles = ref([]);
const showProfileLoadMenu = ref(false);

const character = ref({
  bab: 0,
  strength: 10,
  hpCurrent: 0,
  hpMax: 0,
  armorClass: 10,
  attacks: []
});

const strengthMod = computed(() =>
  Math.floor((character.value.strength - 10) / 2)
);

function addAttack() {
  addAttackUtil(character.value);
}

function deleteAttack(index, character) {
  deleteAttackUtil(index, character);
}



function rollAttack(index) {
  const attack = character.value.attacks[index];
  attack.lastRoll = rollAttackUtil(attack, character.value.bab, character.value.strength);
}


function saveCurrentProfile() {
  const profileData = { ...character.value };
  saveProfile(profileName.value, profileData);
  profileName.value = '';
}

function openProfileLoadMenu() {
  savedProfiles.value = getSavedProfileNames();
  showProfileLoadMenu.value = true;
}

function loadSelectedProfile(name) {
  const profile = loadProfile(name);
  if (profile) {
    character.value.bab = profile.bab;
    character.value.strength = profile.strength;
    character.value.hpCurrent = profile.hpCurrent;
    character.value.hpMax = profile.hpMax;
    character.value.armorClass = profile.armorClass;
    character.value.attacks = profile.attacks.map(a => ({
      ...a,
      editing: false,
      lastRoll: null
    }));
    showProfileLoadMenu.value = false;
  }
}

function openAttackLoadMenu() {
  savedAttackNames.value = getSavedAttackNames();
  showAttackLoadMenu.value = true;
}

function loadAttackByName(name) {
  const saved = loadSingleAttack(name);
  if (!saved) return;

  character.value.attacks.push({
    ...saved,
    editing: false,
    lastRoll: null,
    loadedBab: character.value.bab    // ← capture the current BAB here
  });

  showAttackLoadMenu.value = false;
}


function saveAttack(index, name) {
  const attack = { ...character.value.attacks[index] };
  delete attack.lastRoll;
  saveSingleAttack(name, attack);
}

  </script>
  
  <style scoped>
.mypage {
  text-align: center;
  margin-top: 40px;
  padding: 0 20px;
  font-family: sans-serif;
}

.input-group,
.output-group {
  margin-bottom: 20px;
}

input,
select {
  padding: 6px;
  margin: 0 8px;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

input[type="number"],
select {
  max-width: 120px;
}

button {
  padding: 6px 12px;
  margin: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
  border-radius: 6px;
  background-color: #e0e0e0;
}

button:hover {
  background-color: #d0d0d0;
}

.attack-entry {
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 16px;
  margin: 16px auto;
  max-width: 700px;
  background-color: #f9f9f9;
  text-align: left;
}

.attack-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.edit-button {
  margin-left: auto;
}

.attack-fields {
  padding: 12px;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px dashed #bbb;
  margin-top: 10px;
}

.attack-fields label,
.attack-display p {
  display: block;
  margin: 6px 0;
}

.attack-fields label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-button {
  margin: 20px auto;
  display: block;
}

.row-group {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 10px 0;
}

.count-short input {
  width: 60px;
}

.damage-types {
  margin-top: 8px;
}

.damage-types label {
  margin-right: 12px;
}

.combat-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 12px 0;
}

.roll-section {
  background-color: #f1f1f1;
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
  font-size: 0.95em;
}

.roll-section ul {
  margin-top: 8px;
  padding-left: 20px;
}

.inline-roll-btn {
  margin-top: 10px;
}

hr {
  margin: 16px 0;
  border: none;
  border-top: 1px solid #ccc;
}
</style>
