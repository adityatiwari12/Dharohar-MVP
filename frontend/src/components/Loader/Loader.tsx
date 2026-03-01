import { useEffect, useState } from 'react';
import ceremonialSymbol from '../../assets/image copy 2.png';
import './Loader.css';

interface LoaderProps {
    label?: string;
}

/**
 * DHAROHAR Global Loader
 *
 * A premium institutional loader using the ceremonial symbol.
 * Rotates slowly (10s linear infinite) over a soft parchment overlay.
 * Fades in on mount, pass `exiting` to trigger fade-out before unmount.
 *
 * Usage:
 *   <Loader />                        — default, no label
 *   <Loader label="Processing..." />  — with label
 */
export const Loader = ({ label }: LoaderProps) => {
    const [show, setShow] = useState(false);

    // Defer mounting by one frame so the fade-in animation actually plays
    useEffect(() => {
        const raf = requestAnimationFrame(() => setShow(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    if (!show) return null;

    return (
        <div className="dharohar-loader-overlay" role="status" aria-label={label || 'Loading'}>
            <div className="dharohar-loader-symbol-wrap">
                <div className="dharohar-loader-ring" aria-hidden="true" />
                <img
                    src={ceremonialSymbol}
                    alt=""
                    className="dharohar-loader-image"
                    draggable={false}
                />
            </div>
            {label && (
                <p className="dharohar-loader-label">{label}</p>
            )}
        </div>
    );
};

export default Loader;
