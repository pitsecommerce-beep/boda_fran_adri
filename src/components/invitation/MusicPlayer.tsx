import { useEffect, useRef, useState } from 'react'

interface Props {
  musicUrl: string | null
  started: boolean
}

export default function MusicPlayer({ musicUrl, started }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [muted, setMuted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!started || !musicUrl || !audioRef.current) return
    setVisible(true)
    const audio = audioRef.current
    audio.volume = 0.4
    audio.loop = true
    audio.play().catch(() => { /* browser may block autoplay */ })
  }, [started, musicUrl])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.muted = muted
  }, [muted])

  if (!musicUrl) return null

  return (
    <>
      <audio ref={audioRef} src={musicUrl} preload="auto" />
      {visible && (
        <button
          type="button"
          className="music-btn"
          onClick={() => setMuted(m => !m)}
          title={muted ? 'Reactivar música' : 'Silenciar música'}
          aria-label={muted ? 'Reactivar música' : 'Silenciar música'}
        >
          {muted ? (
            /* Play / reactivate icon */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            /* Sound waves icon */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      )}
    </>
  )
}
