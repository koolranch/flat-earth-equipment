import React from 'react';
/** Loads external SVGs with SMIL safely. Uses <object> for animation, falls back to <img>. */
export default function AnimatedSvg({ src, title, className, style }: { src: string; title?: string; className?: string; style?: React.CSSProperties }) {
  const [errored, setErrored] = React.useState(false);
  return (
    <div className={className} style={style}>
      {errored ? (
        // Fallback still shows the static frame
        <img src={src} alt={title || 'animated graphic'} loading="lazy" />
      ) : (
        <object data={src} type="image/svg+xml" aria-label={title} onError={() => setErrored(true)}>
          <img src={src} alt={title || 'animated graphic'} loading="lazy" />
        </object>
      )}
    </div>
  );
}
