import { cn } from "../../lib/utils";

type Mood = "default" | "wink" | "shh";

interface GhostLogoProps {
  size?: number;
  mood?: Mood;
  className?: string;
  withWordmark?: boolean;
}

export function GhostLogo({ size = 32, mood = "default", className }: GhostLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Body */}
      <path
        d="M32 6c-10.5 0-19 8.5-19 19v25.5c0 2.6 3 4 5 2.4l3.4-2.7a3 3 0 0 1 3.7 0l3.4 2.7a3 3 0 0 0 3.7 0l3.4-2.7a3 3 0 0 1 3.7 0l3.4 2.7a3 3 0 0 0 3.7 0l3.4-2.7a3 3 0 0 1 3.7 0l3.4 2.7c2 1.6 5 .2 5-2.4V25c0-10.5-8.5-19-19-19Z"
        fill="currentColor"
      />
      {/* Cheek blush */}
      <ellipse cx="20" cy="34" rx="3" ry="2" fill="white" opacity="0.18" />
      <ellipse cx="44" cy="34" rx="3" ry="2" fill="white" opacity="0.18" />
      {/* Eyes */}
      {mood === "wink" ? (
        <>
          <circle cx="25" cy="28" r="2.4" fill="white" />
          <path d="M37 28h6" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        </>
      ) : mood === "shh" ? (
        <>
          <path d="M23 28h4" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M37 28h4" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M30 36c1 1 3 1 4 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="25" cy="28" r="2.4" fill="white" />
          <circle cx="39" cy="28" r="2.4" fill="white" />
          <path d="M28 36c1.5 1.4 6.5 1.4 8 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-primary">
        <GhostLogo size={28} />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">
        Whisper
      </span>
    </div>
  );
}
