import { Ghost } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: (e: React.MouseEvent) => void;
}

const sizeMap = {
  sm: { icon: 24, text: 'text-xl' },
  md: { icon: 32, text: 'text-2xl' },
  lg: { icon: 44, text: 'text-3xl' },
  xl: { icon: 72, text: 'text-5xl' },
};

export function Logo({ size = 'md', onClick }: LogoProps) {
  const s = sizeMap[size];
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="relative">
        <Ghost size={s.icon} className="text-loki-green drop-shadow-[0_0_10px_rgba(0,255,102,0.7)]" />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-bold tracking-widest text-glow ${s.text}`}>
          LOKI<span className="text-loki-green"> TV</span>
        </span>
        <span className="text-[0.6rem] tracking-[0.3em] text-loki-gray-dim font-mono mt-1">
          GOD OF STORIES
        </span>
      </div>
    </div>
  );
}
