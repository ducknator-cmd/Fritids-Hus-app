import { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  error:   <XCircle className="w-5 h-5 text-red-500" />,
  info:    <Info className="w-5 h-5 text-indigo-500" />,
};

const BG = {
  success: 'bg-green-50 border-green-200',
  warning: 'bg-amber-50 border-amber-200',
  error:   'bg-red-50 border-red-200',
  info:    'bg-indigo-50 border-indigo-200',
};

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  const type = toast.type ?? 'info';
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${BG[type]}`}>
        {ICONS[type]}
        <p className="text-sm text-gray-800 leading-snug">{toast.message}</p>
      </div>
    </div>
  );
}
