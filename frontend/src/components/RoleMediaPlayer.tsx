import { useRef, useEffect, useState } from 'react';
import './RoleMediaPlayer.css';

interface RoleMediaPlayerProps {
    src: string;
    /** 'full' = unlimited. 'preview' = capped at previewSeconds (default 30). */
    mode: 'full' | 'preview';
    previewSeconds?: number;
    label?: string;
    /** If true the player uses <video> regardless of extension */
    forceVideo?: boolean;
}

/**
 * Shared media player used across all roles.
 * - Community / Review / Admin → mode="full" (no time restriction)
 * - Public / General (no license) → mode="preview" (stops at 30 s)
 */
export const RoleMediaPlayer = ({
    src,
    mode,
    previewSeconds = 30,
    label,
    forceVideo = false,
}: RoleMediaPlayerProps) => {
    const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
    const [previewEnded, setPreviewEnded] = useState(false);

    const isVideo = forceVideo || /\.(mp4|webm|ogv)$/i.test(src);

    // Preview mode: pause at previewSeconds and show a nudge
    useEffect(() => {
        if (mode !== 'preview') return;
        const el = mediaRef.current;
        if (!el) return;

        const onTimeUpdate = () => {
            if (el.currentTime >= previewSeconds) {
                el.pause();
                el.currentTime = previewSeconds;
                setPreviewEnded(true);
            }
        };

        const onPlay = () => {
            if (previewEnded) {
                el.currentTime = 0;
                setPreviewEnded(false);
            }
        };

        el.addEventListener('timeupdate', onTimeUpdate);
        el.addEventListener('play', onPlay);
        return () => {
            el.removeEventListener('timeupdate', onTimeUpdate);
            el.removeEventListener('play', onPlay);
        };
    }, [mode, previewSeconds, previewEnded]);

    return (
        <div className="rmp-wrapper">
            {label && <p className="rmp-label">{label}</p>}

            <div className="rmp-player-area">
                {isVideo ? (
                    <video
                        ref={mediaRef as React.RefObject<HTMLVideoElement>}
                        controls
                        src={src}
                        className="rmp-video"
                        preload="metadata"
                    />
                ) : (
                    <audio
                        ref={mediaRef as React.RefObject<HTMLAudioElement>}
                        controls
                        src={src}
                        className="rmp-audio"
                        preload="metadata"
                    />
                )}
            </div>

            {/* Preview ended banner */}
            {mode === 'preview' && previewEnded && (
                <div className="rmp-preview-banner">
                    <span>🔒 {previewSeconds}-second preview ended</span>
                    <span className="rmp-preview-hint">Apply for a license to access the full file →</span>
                </div>
            )}

            {/* Static preview badge (before any play) */}
            {mode === 'preview' && !previewEnded && (
                <div className="rmp-preview-badge">
                    🎧 {previewSeconds}s free preview
                </div>
            )}
        </div>
    );
};
