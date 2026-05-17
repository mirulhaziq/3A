'use client';

import { useRef } from 'react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import type { CuppyState } from '@/types';

import smilingAnimation from '../../public/smiling mascot.json';
import waveAnimation from '../../public/wave mascot.json';
import waitAnimation from '../../public/wait mascot.json';
import sadAnimation from '../../public/Sad mascot.json';

interface CuppyImageProps {
  state?: CuppyState | 'wave';
  size?: 'tiny' | 'small' | 'medium' | 'large';
  className?: string;
}

const sizeMap = { tiny: 40, small: 64, medium: 120, large: 200 } as const;

function getAnimation(state: CuppyState | 'wave') {
  switch (state) {
    case 'happy':
    case 'celebrate':
      return smilingAnimation;
    case 'wave':
      return waveAnimation;
    case 'thinking':
      return waitAnimation;
    case 'judgy':
    case 'idle':
    default:
      return sadAnimation;
  }
}

export default function CuppyImage({
  state = 'happy',
  size = 'medium',
  className,
}: CuppyImageProps) {
  const px = sizeMap[size];
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const handleMouseEnter = () => {
    lottieRef.current?.goToAndPlay(0);
  };

  return (
    <div
      style={{ width: px, height: px, flexShrink: 0, cursor: 'default' }}
      className={className}
      onMouseEnter={handleMouseEnter}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={getAnimation(state)}
        loop={false}
        autoplay
        style={{ width: px, height: px }}
      />
    </div>
  );
}
