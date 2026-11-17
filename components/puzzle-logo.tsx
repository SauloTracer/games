type Props = {
  size?: number;
  className?: string;
};

/** Ícone de peças de quebra-cabeça usado na marca Puzzled. */
export function PuzzleLogo({ size = 28, className }: Props) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="11" width="18" height="18" rx="2" />
      <path d="M12 11v18M3 20h18" />
      <rect x="17" y="3" width="11" height="11" rx="2" transform="rotate(12 22 8)" />
    </svg>
  );
}
