<template>
    <!-- Landing Page Component -->
    <LandingPage
      v-if="showLanding"
      @start-new="startNew"
      @load-profile="onLoadProfile"
    />

    <!-- Main Calculator Page -->
    <div class="mypage">
      <h1>Pathfinder Attack Calculator</h1>
      <p v-if="currentProfileName" class="current-profile">
        <em>Profile: {{ currentProfileName }}</em>
      </p>

      <div style="margin-bottom: 20px;">
      <input v-model="profileName" placeholder="Profile name" />
      <button
        v-if="!currentProfileName"
        @click="saveCurrentProfile"
      >
        💾 Save Profile
      </button>
      <button
        v-else
        @click="overwriteCurrentProfile"
      >
        💾 Overwrite Profile
      </button>
      <button @click="openProfileLoadMenu">📂 Load Profile</button>
    </div>

      <!-- Profile & Conditions Row -->
      <div class="profile-conditions-row">
        <!-- Profile Inputs -->
        <div class="profile-section">
          <div class="input-group">
            <label>Current HP:</label>
            <input type="number" v-model.number="character.hpCurrent" />
          </div>
          <div class="input-group">
            <label>Max HP:</label>
            <input type="number" v-model.number="character.hpMax" />
          </div>
          <div class="input-group">
            <label>AC:</label>
            <input type="number" v-model.number="character.armorClass" />
          </div>
          <div class="input-group">
            <label>BAB:</label>
            <input type="number" v-model.number="character.bab" />
          </div>
          <div class="input-group">
            <label>Str:</label>
            <input type="number" v-model.number="character.strength" />
          </div>
          <div class="output-group">
            <p><strong>BAB:</strong> {{ character.bab }}</p>
            <p><strong>STR mod:</strong> {{ strengthMod }}</p>
          </div>
        </div>

        <!-- Conditions Panel -->
        <aside class="conditions-section">
          <h2>Conditions</h2>
          <ul>
            <li v-for="cond in conditions" :key="cond.name">
              <label>
                <input type="checkbox" v-model="cond.active" />
                {{ cond.name }}
              </label>
            </li>
          </ul>
        </aside>
      </div>

      <div v-if="showProfileLoadMenu">
        <h3>Select a profile:</h3>
        <ul>
          <li v-for="name in savedProfiles" :key="name">
            <button @click="loadSelectedProfile(name)">{{ name }}</button>
          </li>
        </ul>
      </div>

  
      <hr/>
  
      <h2>Attacks</h2>
  
      <div
        v-for="(attack, index) in character.attacks"
        :key="index"
        class="attack-entry"
        :class="{ editing: attack.editing }"
      >
        <div class="attack-header">
          <label class="include-toggle">
                <input type="checkbox" v-model="attack.includeInSummary" />
              </label>
          <h3>{{ attack.name || 'New Attack' }}
                <span v-if="attack.isIterative"> (Attack #{{ attack.iteration }})</span>

          </h3>
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
            <label><input type="checkbox" v-model="attack.natural" /> Natural</label>
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

          

          <button
            @click="() => {
              saveAttack(index, attack.name);
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
               <strong>Attack:</strong>
                {{
                 // use the clone’s loadedBab if present, otherwise fall back
                 (attack.loadedBab != null ? attack.loadedBab : effectiveBab)
                 + calculateDamageBonus(attack, character.strength)
               }}
             /(
              {{ attack.count }}{{ attack.die }}
              <span v-if="attack.slashing"> Slashing</span>
              <span v-else-if="attack.piercing"> Piercing</span>
              <span v-else-if="attack.blunt"> Bludgeoning</span>
              <template v-for="(bonus, idx) in attack.extraDamage" :key="idx">
                + {{ bonus.count }}{{ bonus.die }} {{ bonus.type }}
              </template>
              + {{ calculateDamageBonus(attack, character.strength) + getConditionDamageBonusFor(attack) }}
            )
          </p>
          <p>
          <strong>Material:</strong> {{ attack.material || '—' }}
          &nbsp;|&nbsp;
          <strong>Reach:</strong> {{ attack.reach }} ft
          &nbsp;|&nbsp;
          <strong>2Hand:</strong> {{ attack.twoHanded }}
        </p>
  
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
  
          <!-- Roll All and Summary -->
      <div class="roll-all-section">
        <button class="roll-all-btn" @click="rollAll">🎲 Roll All</button>
      </div>
      <div class="damage-summary" v-if="summary.totalDamage !== null">
        <h3>Damage Summary</h3>
        <p><strong>Total Damage:</strong> {{ summary.totalDamage }}</p>
        <div v-for="(amt, type) in summary.byElement" :key="type">
          <p><strong>{{ type }} Damage:</strong> {{ amt }}</p>
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
  import { ref, computed, watch } from 'vue';

  //LANDING PAGE
  import LandingPage from './LandingPage.vue';

  function startNew() {
    showLanding.value = false;
  }

  const currentProfileName = ref('');

  function onLoadProfile(name) {
    const profile = loadProfile(name);
    character.value = profile;
        character.value = {
      ...profile,
      attacks: profile.attacks.map(a => ({
        ...a,
        editing: false,
        lastRoll: null,
        includeInSummary: true
      }))
    };
    currentProfileName.value = name;
    showLanding.value = false;
  }

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
    //displayDamageTypes,

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

  // Profile save/load UI state
const showLanding = ref(true);
const profileName = ref('');
const savedProfiles = ref([]);
const showProfileLoadMenu = ref(false);
  
const savedAttackNames = ref([]);
const showAttackLoadMenu = ref(false);
const saveAttackName = ref('');



const character = ref({
  name: '',
  bab: 0,
  strength: 10,
  hpCurrent: 0,
  hpMax: 0,
  armorClass: 10,
  attacks: []
});

const conditions = ref([
  { name: 'Power Attack', active: false}
]);

const powerAttackPenalty = computed(() => {
  return conditions.value.some(c => c.name === 'Power Attack' && c.active)
    ? 1 + Math.floor(character.value.bab / 4)
    : 0;
});

// Computed effective BAB after penalties
const effectiveBab = computed(() => {
  return character.value.bab - powerAttackPenalty.value
});

function getIterativeCount(bab) {
  // 1 attack at BAB 1–5, 2 at 6–10, 3 at 11–15, 4 at 16+
  return Math.floor((bab - 1) / 5) + 1;
}

watch(() => character.value.bab, (bab) => {
  const iterCount = getIterativeCount(bab);
  // find your “base” primary attack
  const base = character.value.attacks.find(a => a.primary && !a.isIterative);
  if (!base) return;

  // remove any old iterative clones
  character.value.attacks = character.value.attacks.filter(a => !a.isIterative);

  // insert N−1 clones immediately after the base
  const baseIndex = character.value.attacks.indexOf(base);
  for (let i = 1; i < iterCount; i++) {
    const iterBAB = bab - (i * 5);
    const clone = {
      ...base,
      isIterative: true,        // flag so we can filter it out later
      iteration: i + 1,
      editing: false,
      lastRoll: null,
      loadedBab: iterBAB        // step BAB down by 5 per
    };
    character.value.attacks.splice(baseIndex + i, 0, clone);
  }
  },
 { immediate: true } // run once at component init
);


// Computed extra damage from conditions

function getConditionDamageBonusFor(attack) {
  // inactive → no bonus
  if (!conditions.value.some(c => c.name === 'Power Attack' && c.active)) return 0;

  // Base penalty progression: –1 atk, +2 dmg at BAB1; then +2/+4 at BAB4; etc.
  const pen = 1 + Math.floor(character.value.bab / 4);

  // Determine multiplier: 2×pen for primary, 1×pen for secondary
  let mult = attack.secondary ? 1 : 2;

  // Two‑handed weapons deal 1.5× the normal bonus
  if (attack.twoHanded) {
    mult = Math.floor(mult * 1.5);
  }

  return pen * mult;
}

watch(powerAttackPenalty, (newP, oldP) => {
  const deltaPen = newP - oldP;
  character.value.attacks.forEach(atk => {
    if (!atk.lastRoll) return;
    const deltaDmg = deltaPen * (atk.secondary ? 1 : 2);
    atk.lastRoll.baseDamage.bonus += deltaDmg;
    atk.lastRoll.baseDamage.total += deltaDmg;
    if (atk.lastRoll.critDamage) {
      atk.lastRoll.critDamage.bonus += deltaDmg;
      atk.lastRoll.critDamage.total += deltaDmg;
    }
  });
});

const strengthMod = computed(() =>
  Math.floor((character.value.strength - 10) / 2)
);

function addAttack() {
  addAttackUtil(character.value);
  const last = character.value.attacks.length - 1;
  character.value.attacks[last].includeInSummary = true;
}

function deleteAttack(index, character) {
  deleteAttackUtil(index, character);
}

function rollAttack(index) {
  const atk = character.value.attacks[index];
  const babUsed = atk.loadedBab != null ? atk.loadedBab : effectiveBab.value;
  atk.lastRoll = rollAttackUtil(atk, babUsed, character.value.strength);
  // adjust damage totals for condition bonuses
  const conditionDamageBonus = getConditionDamageBonusFor(atk);
  atk.lastRoll.baseDamage.bonus += conditionDamageBonus;
  atk.lastRoll.baseDamage.total += conditionDamageBonus;
  if (atk.lastRoll.critDamage) {
    atk.lastRoll.critDamage.bonus += conditionDamageBonus;
    atk.lastRoll.critDamage.total += conditionDamageBonus;
  }
}

function rollAll() {
  character.value.attacks.forEach((_, i) => rollAttack(i));
}


const summary = computed(() => {
  let total = 0;
  const byElement = {};
  character.value.attacks.forEach(a => {
    if (!a.lastRoll || !a.includeInSummary) return;
    // Base and crit damage
    const base = a.lastRoll.baseDamage.total;
    const crit = a.lastRoll.critDamage?.total || 0;
    total += base + crit;
    // Base damage type grouping
    let baseType = 'Unspecified';
    if (a.slashing) baseType = 'Slashing';
    else if (a.piercing) baseType = 'Piercing';
    else if (a.blunt) baseType = 'Bludgeoning';
    byElement[baseType] = (byElement[baseType] || 0) + base + crit;
    // Extra damage
    a.lastRoll.extraDamage.forEach(d => {
      total += d.amount;
      byElement[d.type] = (byElement[d.type] || 0) + d.amount;
    });
  });
  return {
    totalDamage: character.value.attacks.some(a => a.lastRoll && a.includeInSummary) ? total : null,
    byElement
  };
});


function saveCurrentProfile() {
  if (!profileName.value) return;
  const profileData = { ...character.value };
  saveProfile(profileName.value, profileData);
  currentProfileName.value = profileName.value;
  profileName.value = '';
}

function overwriteCurrentProfile() {
  if (!currentProfileName.value) return;
  const profileData = { ...character.value };
  saveProfile(currentProfileName.value, profileData);
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
    currentProfileName.value = name; 
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
    includeInSummary: true,
    loadedBab: character.value.bab    // ← capture the current BAB here
  });

  showAttackLoadMenu.value = false;
}


function saveAttack(index, name) {
  const attackCopy = { ...character.value.attacks[index] };
  delete attackCopy.lastRoll;
  delete attackCopy.includeInSummary;
  saveSingleAttack(name, attackCopy);
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

main-container { display: flex; flex-direction: column; }
.profile-conditions-row { display: flex; justify-content: space-between; gap: 24px; }
.profile-section { flex: 2; }
.conditions-section { flex: 1; background: #f5f5f5; padding: 16px; border-radius: 8px; }

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

.roll-all-section { margin-top: 20px; text-align: center; }
.roll-all-btn { padding: 8px 16px; font-size: 1rem; }
.damage-summary { margin-top: 20px; background: #f9f9f9; 
  padding: 16px; border-radius: 8px; max-width: 700px; 
  margin: 0 auto; text-align: left; }

hr {
  margin: 16px 0;
  border: none;
  border-top: 1px solid #ccc;
}
</style>
