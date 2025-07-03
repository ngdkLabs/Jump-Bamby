import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  shootSound: HTMLAudioElement | null;
  explosionSound: HTMLAudioElement | null;
  deadSound: HTMLAudioElement | null;
  deadMinionSound: HTMLAudioElement | null;
  jumpSound: HTMLAudioElement | null;
  bagorSound: HTMLAudioElement | null;
  isMuted: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setShootSound: (sound: HTMLAudioElement) => void;
  setExplosionSound: (sound: HTMLAudioElement) => void;
  setDeadSound: (sound: HTMLAudioElement) => void;
  setDeadMinionSound: (sound: HTMLAudioElement) => void;
  setJumpSound: (sound: HTMLAudioElement) => void;
  setBagorSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playShoot: () => void;
  playExplosion: () => void;
  playDead: () => void;
  playDeadMinion: () => void;
  playJump: () => void;
  playBagor: () => void;
  restartBackgroundMusic: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  shootSound: null,
  explosionSound: null,
  deadSound: null,
  deadMinionSound: null,
  jumpSound: null,
  bagorSound: null,
  isMuted: true, // Start muted by default
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  setShootSound: (sound) => set({ shootSound: sound }),
  setExplosionSound: (sound) => set({ explosionSound: sound }),
  setDeadSound: (sound) => set({ deadSound: sound }),
  setDeadMinionSound: (sound) => set({ deadMinionSound: sound }),
  setJumpSound: (sound) => set({ jumpSound: sound }),
  setBagorSound: (sound) => set({ bagorSound: sound }),
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    set({ isMuted: newMutedState });
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      if (isMuted) {
        return;
      }
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(() => {});
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      if (isMuted) {
        return;
      }
      successSound.currentTime = 0;
      successSound.play().catch(() => {});
    }
  },
  
  playShoot: () => {
    const { shootSound, isMuted } = get();
    if (shootSound) {
      if (isMuted) {
        return;
      }
      const soundClone = shootSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(() => {});
    }
  },
  
  playExplosion: () => {
    const { explosionSound, isMuted } = get();
    if (explosionSound) {
      if (isMuted) {
        return;
      }
      const soundClone = explosionSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(() => {});
    }
  },
  
  playDead: () => {
    const { deadSound, isMuted } = get();
    if (deadSound) {
      if (isMuted) {
        return;
      }
      const soundClone = deadSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.5;
      soundClone.play().catch(() => {});
    }
  },
  
  playDeadMinion: () => {
    const { deadMinionSound, isMuted } = get();
    if (deadMinionSound) {
      if (isMuted) {
        return;
      }
      const soundClone = deadMinionSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.5;
      soundClone.play().catch(() => {});
    }
  },
  
  playJump: () => {
    const { jumpSound, isMuted } = get();
    if (jumpSound && !isMuted) {
      const soundClone = jumpSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.4;
      soundClone.play().catch(() => {});
    }
  },
  
  playBagor: () => {
    const { bagorSound, isMuted } = get();
    if (bagorSound && !isMuted) {
      const soundClone = bagorSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.7;
      soundClone.play().catch(() => {});
    }
  },
  
  restartBackgroundMusic: () => {
    const { backgroundMusic, isMuted } = get();
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
      if (!isMuted) {
        backgroundMusic.play().catch(() => {});
      }
    }
  }
}));

// Expose setDeadSound to the window object
if (typeof window !== 'undefined') {
  (window as any).setDeadSound = useAudio.getState().setDeadSound;
  (window as any).setDeadMinionSound = useAudio.getState().setDeadMinionSound;
  (window as any).useAudio = useAudio;
}
