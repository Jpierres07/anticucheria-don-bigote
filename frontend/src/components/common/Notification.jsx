import React from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';

const Notification = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="text-emerald-400" size={20} />,
    error: <XCircle className="text-rose-400" size={20} />,
    warning: <AlertCircle className="text-amber-400" size={20} />,
    info: <Info className="text-sky-400" size={20} />
  };

  const bgClasses = {
    success: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200',
    error: 'bg-rose-950/80 border-rose-500/40 text-rose-200',
    warning: 'bg-amber-950/80 border-amber-500/40 text-amber-200',
    info: 'bg-sky-950/80 border-sky-500/40 text-sky-200'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl animate-bounce-in ${bgClasses[type]}`}>
      {icons[type]}
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-2 text-zinc-400 hover:text-white">
          &times;
        </button>
      )}
    </div>
  );
};

export default Notification;
