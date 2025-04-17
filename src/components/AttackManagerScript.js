export const availableDice = ['d4', 'd6', 'd8', 'd10', 'd12'];


export function calculateDamageBonus(attack, strength) {
  let mod = Math.floor((strength - 10) / 2);
  if (attack.twoHanded) mod = Math.floor(mod * 1.5);
  if (attack.secondary) mod = Math.floor(mod * 0.5);
  return mod + (attack.magical ? 1 : 0);
}

export function addAttack(character) {
  character.attacks.push({
    name: '',
    die: 'd6',
    count: 1,
    critRange: 20,
    magical: false,
    material: 'Basic',
    slashing: false,
    piercing: false,
    blunt: false,
    primary: true,
    secondary: false,
    twoHanded: false,
    editing: true,
    lastRoll: null,
    extraDamage: [],
    reach: 5
  });
}

export function togglePrimary(attack) {
  attack.primary = !attack.primary;
  if (attack.primary) attack.secondary = false;
}

export function toggleSecondary(attack) {
  attack.secondary = !attack.secondary;
  if (attack.secondary) attack.primary = false;
}


export function addExtraDamage(attack) {
  attack.extraDamage.push({
    type: '',
    die: 'd6',
    count: 1
  });
}

export function completeAttack(index, character) {
  character.attacks[index].editing = false;
}

export function editAttack(index, character) {
  character.attacks[index].editing = true;
}

export function deleteAttack(index, character) {
  character.attacks.splice(index, 1);
}

// near the top of AttackManagerScript.js
const PROFILE_STORAGE_KEY = 'pf1e_profiles';

export function saveProfile(name, profileData) {
  const all = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || '{}');
  all[name] = profileData;
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(all));
}

export function loadProfile(name) {
  const all = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || '{}');
  return all[name] || null;
}

export function getSavedProfileNames() {
  const all = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || '{}');
  return Object.keys(all);
}


//Saves Character Attack
const ATTACK_STORAGE_KEY = 'pf1e_saved_attacks';

export function saveSingleAttack(name, attack) {
  const current = JSON.parse(localStorage.getItem(ATTACK_STORAGE_KEY) || '{}');
  current[name] = attack;
  localStorage.setItem(ATTACK_STORAGE_KEY, JSON.stringify(current));
}

export function getSavedAttackNames() {
  const current = JSON.parse(localStorage.getItem(ATTACK_STORAGE_KEY) || '{}');
  return Object.keys(current);
}

export function loadSingleAttack(name) {
  const current = JSON.parse(localStorage.getItem(ATTACK_STORAGE_KEY) || '{}');
  return current[name] || null;
}




function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollDice(count, sides) {
  const rolls = Array.from({ length: count }, () => rollDie(sides));
  const total = rolls.reduce((sum, val) => sum + val, 0);
  return { rolls, total };
}

export function rollAttack(attack, bab, strength) {
  const dieSides = parseInt(attack.die.substring(1));
  const strengthMod = Math.floor((strength - 10) / 2);
  let baseBonus = strengthMod;

  if (attack.twoHanded) baseBonus = Math.floor(strengthMod * 1.5);
  if (attack.secondary) baseBonus = Math.floor(strengthMod * 0.5);
  baseBonus += attack.magical ? 1 : 0;

  const attackRollRaw = rollDie(20);
  const attackTotal = attackRollRaw + bab + baseBonus;

  const baseRoll = rollDice(attack.count, dieSides);
  const baseDamageTotal = baseRoll.total + baseBonus;

  const extraResults = attack.extraDamage.map(bonus => {
    const sides = parseInt(bonus.die.substring(1));
    const { rolls, total } = rollDice(bonus.count, sides);
    return {
      type: bonus.type,
      count: bonus.count,
      die: bonus.die,
      amount: total,
      rolls
    };
  });

  let lastRoll = {
    attack: {
      raw: attackRollRaw,
      mod: bab + baseBonus,
      total: attackTotal,
      isCrit: attackRollRaw >= attack.critRange
    },
    baseDamage: {
      rolls: baseRoll.rolls,
      bonus: baseBonus,
      total: baseDamageTotal
    },
    extraDamage: extraResults,
    statsAtRoll: {
      strength,
      strengthMod,
      bab
    },
    critConfirmation: {
      raw: null,
      total: null,
      confirmed: false
    },
    critDamage: {
      rolls: [],
      bonus: 0,
      total: 0
    }
  };

  // Handle crit
  if (attackRollRaw >= attack.critRange) {
    const confirmRollRaw = rollDie(20);
    const confirmTotal = confirmRollRaw + bab + baseBonus;
    const confirmed = confirmTotal >= 10;

    if (confirmed) {
      const extraBaseRoll = rollDice(attack.count, dieSides);
      lastRoll.critDamage = {
        rolls: extraBaseRoll.rolls,
        bonus: baseBonus,
        total: extraBaseRoll.total + baseBonus
      };
    }

    lastRoll.critConfirmation = {
      raw: confirmRollRaw,
      total: confirmTotal,
      confirmed
    };
  }

  return lastRoll;
}


export function displayDamageTypes(attack) {
  let types = [];
  if (attack.piercing) types.push('P');
  if (attack.slashing) types.push('S');
  if (attack.blunt) types.push('B');
  return types.join('/');
}
