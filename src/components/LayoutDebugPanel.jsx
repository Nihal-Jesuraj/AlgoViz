import React from 'react';
import { Camera, CheckCircle2, XCircle, AlertTriangle, Cpu, Save, RefreshCw } from 'lucide-react';

export default function LayoutDebugPanel({ debugInfo, onSwitchLayout }) {
  if (!debugInfo) return null;

  const { 
    source, 
    timeMs, 
    fingerprint,
    confidence, 
    status, 
    reason, 
    selectedImage,
    mappedCount,
    totalExpected,
    availableLayouts = []
  } = debugInfo;

  const getSourceIcon = () => {
    switch(source) {
      case 'User Saved': return <Save size={16} className="text-emerald-400" />;
      case 'Fingerprint Cache': return <Cpu size={16} className="text-blue-400" />;
      case 'Vision AI': return <Camera size={16} className="text-purple-400" />;
      case 'Auto-Layout': return <RefreshCw size={16} className="text-gray-400" />;
      default: return <RefreshCw size={16} />;
    }
  };

  return (
    <div className="mt-4 bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
          {getSourceIcon()}
          <span>Layout Source: {source}</span>
        </div>
        <div className="text-xs font-mono text-[var(--color-text-subtle)]">{timeMs}ms</div>
      </div>

      <div className="flex flex-col gap-2 text-xs font-mono text-[var(--color-text-muted)]">
        <div className="flex justify-between">
          <span>Status:</span>
          <span className={status === 'success' || status === 'cached' ? 'text-emerald-400 flex items-center gap-1' : 'text-red-400 flex items-center gap-1'}>
            {status === 'success' || status === 'cached' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
            {status.toUpperCase()}
          </span>
        </div>

        {fingerprint && (
          <div className="flex justify-between">
            <span>Fingerprint Hash:</span>
            <span className="text-blue-300" title={fingerprint}>
              {fingerprint.substring(0, 16)}...
            </span>
          </div>
        )}

        {confidence !== undefined && (
          <div className="flex justify-between">
            <span>AI Confidence:</span>
            <span className={confidence >= 0.75 ? 'text-emerald-400' : 'text-amber-400 flex items-center gap-1'}>
              {confidence < 0.75 && <AlertTriangle size={12}/>}
              {(confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {mappedCount !== undefined && (
          <div className="flex justify-between">
            <span>Nodes Mapped:</span>
            <span className={mappedCount === totalExpected ? 'text-emerald-400' : 'text-amber-400'}>
              {mappedCount} / {totalExpected}
            </span>
          </div>
        )}

        {reason && (
          <div className="mt-2 text-red-300 bg-red-400/10 p-2 rounded border border-red-400/20 whitespace-pre-wrap">
            {reason}
          </div>
        )}
      </div>

      {/* Layout Switcher Controls */}
      {availableLayouts.length > 1 && (
        <div className="mt-2 border-t border-white/5 pt-3">
          <div className="text-[10px] uppercase font-semibold text-[var(--color-text-subtle)] mb-2">Switch Layout</div>
          <div className="flex gap-2">
            {availableLayouts.map(layout => (
              <button
                key={layout.source}
                onClick={() => onSwitchLayout(layout)}
                className={`flex-1 glass-button !px-2 !py-1 text-xs ${source === layout.source ? 'primary' : ''}`}
              >
                {layout.source}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
