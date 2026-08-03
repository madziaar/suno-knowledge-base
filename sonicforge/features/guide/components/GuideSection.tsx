
import React, { memo } from 'react';

interface GuideSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: any;
  id?: string;
}

const GuideSection: React.FC<GuideSectionProps> = ({ title, children, icon: Icon, id }) => (
  <div id={id} className="glass p-4 md:p-6 rounded-xl border border-zinc-800 mb-6 scroll-mt-24">
    <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center">
      {Icon && <Icon className="w-5 h-5 mr-2 text-yellow-500" />}
      {title}
    </h3>
    <div className="text-zinc-400 space-y-4 text-sm leading-relaxed">
      {children}
    </div>
  </div>
);

export default memo(GuideSection);
