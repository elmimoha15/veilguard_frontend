'use client';

import { useEffect, useRef, useState } from 'react';
import type { PlayerRef, Player as PlayerType } from '@remotion/player';
import DashboardDemo, { DEMO_DURATION } from '@/remotion/DashboardDemo';
import { DEMO_W, DEMO_H, FPS } from '@/remotion/theme';

// A meaningful still to show while paused (the filled-in scan URL).
const POSTER_FRAME = 40;

/**
 * The hero product demo, presented as a clickable, pausable video (the site's
 * "how it works"). It does NOT autoplay or loop: it shows a poster frame with a
 * play button; clicking plays the full flow once, clicking again pauses, and it
 * returns to the poster when finished. The Remotion Player is loaded lazily on
 * the client (it touches `window`), imported directly rather than via
 * next/dynamic so the PlayerRef forwards correctly.
 */
export default function HeroDemoWindow() {
  const [Player, setPlayer] = useState<typeof PlayerType | null>(null);
  const ref = useRef<PlayerRef>(null);
  const [playing, setPlaying] = useState(false);
  const startedRef = useRef(false);

  // client-only lazy load of the player
  useEffect(() => {
    let alive = true;
    import('@remotion/player').then((m) => { if (alive) setPlayer(() => m.Player); });
    return () => { alive = false; };
  }, []);

  // wire play/pause/ended state once the player is mounted
  useEffect(() => {
    const p = ref.current;
    if (!Player || !p) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => { setPlaying(false); startedRef.current = false; p.seekTo(POSTER_FRAME); };
    p.addEventListener('play', onPlay);
    p.addEventListener('pause', onPause);
    p.addEventListener('ended', onEnded);
    return () => {
      p.removeEventListener('play', onPlay);
      p.removeEventListener('pause', onPause);
      p.removeEventListener('ended', onEnded);
    };
  }, [Player]);

  const toggle = () => {
    const p = ref.current;
    if (!p) return;
    if (p.isPlaying()) { p.pause(); return; }
    if (!startedRef.current) { startedRef.current = true; p.seekTo(0); } // first play → from the top
    p.play();
  };

  return (
    <div id="how" className="relative scroll-mt-24">
      <div className="overflow-hidden rounded-[16px] border border-[#EDECE8] shadow-[0_40px_90px_-45px_rgba(0,0,0,0.35)]">
        <div className="relative" style={{ aspectRatio: `${DEMO_W} / ${DEMO_H}`, background: '#F4F4F3' }}>
          {Player && (
            <Player
              ref={ref}
              component={DashboardDemo}
              durationInFrames={DEMO_DURATION}
              fps={FPS}
              compositionWidth={DEMO_W}
              compositionHeight={DEMO_H}
              style={{ width: '100%', height: '100%' }}
              autoPlay={false}
              loop={false}
              controls={false}
              clickToPlay={false}
              doubleClickToFullscreen={false}
              initiallyMuted
              initialFrame={POSTER_FRAME}
              spaceKeyToPlayOrPause={false}
            />
          )}

          {/* click layer: play button when paused; clicking while playing pauses */}
          <button
            type="button"
            onClick={toggle}
            className="group absolute inset-0 flex items-center justify-center"
            style={{ cursor: 'pointer' }}
            aria-label={playing ? 'Pause the demo' : 'Play the demo'}
          >
            {!playing && (
              <>
                <span aria-hidden className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/[0.14]" />
                <span className="relative flex items-center justify-center w-[76px] h-[76px] rounded-full bg-white shadow-[0_12px_34px_-10px_rgba(0,0,0,0.55)] transition-transform duration-200 group-hover:scale-105">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#0A0A0A" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
