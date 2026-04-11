import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

export function VolumeControl() {
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);

  const displayVolume = isMuted ? 0 : volume;

  const VolumeIcon = displayVolume === 0
    ? VolumeX
    : displayVolume < 0.3
    ? Volume
    : displayVolume < 0.7
    ? Volume1
    : Volume2;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleMute}
        className="text-text-secondary hover:text-text-primary transition-colors"
        title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
      >
        <VolumeIcon size={15} />
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.02}
        value={displayVolume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="w-24 accent-gold cursor-pointer"
        title="Volume"
      />
    </div>
  );
}
