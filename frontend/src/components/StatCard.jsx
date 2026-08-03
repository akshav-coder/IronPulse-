import React from 'react';

const StatCard = ({ title, value, desc, icon: Icon, variant = 'indigo' }) => {
  const colors = {
    indigo: {
      border: 'border-indigo-500/10',
      text: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    cyan: {
      border: 'border-cyan-500/10',
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    emerald: {
      border: 'border-emerald-500/10',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    rose: {
      border: 'border-rose-500/10',
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
  };

  const theme = colors[variant] || colors.indigo;

  return (
    <div className={`bg-slate-900 border ${theme.border} rounded-xl p-5 shadow-md flex justify-between items-start`}>
      <div className="space-y-1">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">{title}</span>
        <div className="text-2xl font-extrabold text-slate-100">{value}</div>
        {desc && <span className="text-xs text-slate-500 block">{desc}</span>}
      </div>

      {Icon && (
        <div className={`w-8 h-8 rounded-lg ${theme.bg} ${theme.text} flex items-center justify-center`}>
          <Icon size={18} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
