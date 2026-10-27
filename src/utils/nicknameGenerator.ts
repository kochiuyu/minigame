const ADJECTIVES = [
  'Clever', 'Swift', 'Quiet', 'Strategic', 'Alpha',
  'Quantum', 'Silver', 'Golden', 'Brave', 'Patient',
  'Curious', 'Wise', 'Solar', 'Lunar', 'Cosmic',
  'Noble', 'Mighty', 'Bright', 'Stealthy', 'Vivid'
];

const ANIMALS = [
  'Falcon', 'Fox', 'Owl', 'Otter', 'Wolf',
  'Eagle', 'Panda', 'Tiger', 'Hawk', 'Badger',
  'Lynx', 'Sparrow', 'Dolphin', 'Raven', 'Cheetah'
];

export function generateNickname(seed?: string): string {
  if (seed && seed.trim()) {
    // Generate deterministic nickname from student ID or name
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
    }
    const adj = ADJECTIVES[hash % ADJECTIVES.length];
    const animal = ANIMALS[(Math.floor(hash / 7)) % ANIMALS.length];
    const num = (hash % 89) + 10;
    return `${adj}${animal}_${num}`;
  }

  // Pure random nickname
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${adj}${animal}_${num}`;
}
