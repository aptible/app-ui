import cn from 'classnames';
import { useState } from 'react';

export const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [hover, setHover] = useState(false);
  const onMouseEnter = () => {
    console.log('enter');
    setHover(true);
  };
  const onMouseLeave = () => {
    console.log('leave');
    setHover(false);
  };

  return <div className="relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
    {children}
    <div className={cn([
      "absolute top-0 left-0",
      hover ? '' : 'hidden',
    ])}></div>
  </div>
}
