
import React from 'react';
import { BackArrowIcon } from './Icons';

interface HeaderProps {
  title: string;
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
  return (
    <div className="relative flex items-center justify-center p-4">
      <button onClick={onBack} className="absolute left-4 text-slate-600 hover:text-pink-500 transition-colors">
        <BackArrowIcon className="h-8 w-8" />
      </button>
      <h1 className="text-2xl font-bold text-slate-700 tracking-wider uppercase">{title}</h1>
    </div>
  );
};

export default Header;
