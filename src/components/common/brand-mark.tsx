interface BrandMarkProps {
  size?: number;
  className?: string;
}

// Logo mark used in the navbar, footer, and favicon.
export default function BrandMark({ size = 20, className }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 20 L14 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M13 7.5 L14.6 9.4 L16.5 11 L14.6 12.6 L13 14.5 L11.4 12.6 L9.5 11 L11.4 9.4 Z"
        fill="currentColor"
      />
      <path d="M19 4.5 L19.7 6.3 L21.5 7 L19.7 7.7 L19 9.5 L18.3 7.7 L16.5 7 L18.3 6.3 Z" fill="currentColor" />
      <path d="M6 3.2 L6.4 4.2 L7.4 4.6 L6.4 5 L6 6 L5.6 5 L4.6 4.6 L5.6 4.2 Z" fill="currentColor" />
    </svg>
  );
}
