// components/ui/FrogIcon.tsx
export function FrogIcon(props: { size?: number; className?: string }) {
  const size = props.size ?? 28;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
    >
      <rect
        x="6"
        y="12"
        width="20"
        height="14"
        rx="2"
        fill="#4ade80"
        stroke="#16a34a"
        strokeWidth="1.5"
      />
      <rect
        x="8"
        y="6"
        width="16"
        height="10"
        rx="2"
        fill="#4ade80"
        stroke="#16a34a"
        strokeWidth="1.5"
      />
      <circle
        cx="13"
        cy="10"
        r="2.5"
        fill="white"
        stroke="#16a34a"
        strokeWidth="1"
      />
      <circle
        cx="19"
        cy="10"
        r="2.5"
        fill="white"
        stroke="#16a34a"
        strokeWidth="1"
      />
      <circle cx="13" cy="10" r="1" fill="#16a34a" />
      <circle cx="19" cy="10" r="1" fill="#16a34a" />
      <path
        d="M 14 14 Q 16 15 18 14"
        stroke="#16a34a"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <rect
        x="8"
        y="24"
        width="5"
        height="4"
        rx="1"
        fill="#4ade80"
        stroke="#16a34a"
        strokeWidth="1"
      />
      <rect
        x="19"
        y="24"
        width="5"
        height="4"
        rx="1"
        fill="#4ade80"
        stroke="#16a34a"
        strokeWidth="1"
      />
    </svg>
  );
}
