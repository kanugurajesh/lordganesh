export const config = {
  modelUrl: import.meta.env.BASE_URL + 'models/ganesha.glb' as string | null,
  mobileModelUrl: import.meta.env.BASE_URL + 'models/ganesha-mobile.glb' as string | null,
  introDuration: 7.5,
  blessingDuration: 8,
  maxOfferings: 16,
};

export const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
export const quality = {
  low: matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 4) <= 4,
  reducedMotion: motionPreference.matches,
};
