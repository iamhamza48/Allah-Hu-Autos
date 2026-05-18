import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="relative flex items-center justify-center">
        {/* outer premium blue spinning ring */}
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        
        {/* inner brand navy pulsing glowing dot */}
        <div className="absolute w-8 h-8 rounded-full bg-brand-navy/30 dark:bg-primary/20 animate-ping" />
        <div className="absolute w-4 h-4 rounded-full bg-primary" />
      </div>
      
      {/* Sleek, professional typography */}
      <h3 className="mt-6 text-sm font-bold text-foreground tracking-wider uppercase">
        Loading Allah-Hu-Autos
      </h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
        Preparing premium automotive parts & accessories for you...
      </p>
    </div>
  );
};

export default LoadingState;
