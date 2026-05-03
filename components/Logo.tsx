export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect 
        width="100" 
        height="100" 
        rx="24" 
        className="fill-[#1a1a1a] dark:fill-white transition-colors" 
      />
      {/* Vertical Stem */}
      <path 
        d="M35 25V75" 
        className="stroke-[#f5f0e8] dark:stroke-[#121212] transition-colors"
        strokeWidth="10" 
        strokeLinecap="round"
      />
      {/* Geometric P Loop */}
      <path 
        d="M35 25H58C70 25 78 33 78 45C78 57 70 65 58 65H35" 
        className="fill-[#16a34a] transition-colors"
        fillOpacity="0.9"
      />
      {/* Accent Summit Line */}
      <path 
        d="M50 45L60 35L70 45" 
        className="stroke-[#f5f0e8] dark:stroke-[#121212] transition-colors"
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
