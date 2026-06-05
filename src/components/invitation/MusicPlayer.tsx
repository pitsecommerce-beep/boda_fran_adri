import { useEffect, useRef, useState } from 'react'

interface Props {
  musicUrl: string | null
  started: boolean
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
  return m?.[1] ?? null
}

export default function MusicPlayer({ musicUrl, started }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [muted, setMuted] = useState(false)
  const [visible, setVisible] = useState(false)

  const ytId = musicUrl ? extractYouTubeId(musicUrl) : null
  const isYouTube = Boolean(ytId)

  // Regular audio element logic
  useEffect(() => {
    if (isYouTube || !started || !musicUrl || !audioRef.current) return
    setVisible(true)
    const audio = audioRef.current
    audio.volume = 0.4
    audio.loop = true
    audio.play().catch(() => { /* browser may block autoplay */ })
  }, [started, musicUrl, isYouTube])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.muted = muted
  }, [muted])

  // Pause / resume when the tab or app loses / regains visibility
  useEffect(() => {
    if (isYouTube || !audioRef.current) return
    const audio = audioRef.current
    const onVisChange = () => {
      if (document.hidden) {
        audio.pause()
      } else if (started && !muted) {
        audio.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVisChange)
    return () => document.removeEventListener('visibilitychange', onVisChange)
  }, [isYouTube, started, muted])

  // Show button as soon as YouTube iframe starts
  useEffect(() => {
    if (isYouTube && started) setVisible(true)
  }, [isYouTube, started])

  if (!musicUrl) return null

  const MuteBtn = () => (
    <button
      type="button"
      className="music-btn"
      onClick={() => setMuted(m => !m)}
      title={muted ? 'Reactivar música' : 'Silenciar música'}
      aria-label={muted ? 'Reactivar música' : 'Silenciar música'}
    >
      {muted ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  )

  if (isYouTube) {
    // Embed YouTube as hidden iframe (audio only — video hidden).
    // Recreating the src on mute toggle restarts at current position which is acceptable.
    const ytSrc = started
      ? `https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&mute=${muted ? 1 : 0}`
      : ''

    return (
      <>
        {started && (
          <iframe
            key={`yt-${muted}`}
            src={ytSrc}
            allow="autoplay; encrypted-media"
            style={{
              position: 'fixed',
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: 'none',
              border: 'none',
              bottom: 0,
              left: 0,
              zIndex: -1,
            }}
            title="música de fondo"
          />
        )}
        {visible && <MuteBtn />}
      </>
    )
  }

  return (
    <>
      <audio ref={audioRef} src={musicUrl} preload="auto" />
      {visible && <MuteBtn />}
    </>
  )
}
