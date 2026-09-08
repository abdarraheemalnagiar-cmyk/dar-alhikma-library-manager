import { useEffect, useState } from "react";

/** Shows the uploaded cover, and falls back to the generated house cover on error. */
export function BookCover({
  src,
  fallback,
  alt,
  className,
}: {
  src: string;
  fallback: string;
  alt: string;
  className?: string;
}) {
  const [current, setCurrent] = useState(src);

  useEffect(() => setCurrent(src), [src]);

  return (
    <img
      src={current}
      alt={alt}
      loading="lazy"
      width={600}
      height={900}
      className={className}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
    />
  );
}
