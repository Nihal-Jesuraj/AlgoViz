import React, { memo, useRef, useEffect } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { FileCode } from 'lucide-react';

function CodePanel({ code = '', language = 'java', currentLine = -1, title = 'Code', hideHeader = false, themeId = 'apple', currentStepDescription = '', lineExplanations = [] }) {
  const activeLineRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Auto-scroll active line into view
  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentLine]);

  return (
    <div id="code-panel" className="glass-card flex flex-col overflow-hidden h-full min-h-0">
      {/* Panel header */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileCode size={14} className="text-[var(--color-text-muted)]" />
            <span className="font-heading text-xs font-semibold text-[var(--color-text)] truncate max-w-[220px]">
              {title}
            </span>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--color-accent)] text-white text-[10px] font-mono font-semibold uppercase tracking-wider flex-shrink-0 shadow-sm">
            {language}
          </span>
        </div>
      )}

      {/* Code content — flex-1 with min-h-0 allows proper scrolling */}
      <div
        className="code-panel-container flex-1 m-2 rounded-xl min-h-0"
        ref={scrollContainerRef}
      >
        <Highlight 
          theme={themeId === 'light' ? themes.github : themes.nightOwl} 
          code={code.trimEnd()} 
          language={language}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={className} style={{ ...style, backgroundColor: 'transparent' }}>
              {tokens.map((line, i) => {
                const isActive = i === currentLine;
                const { key: lineKey, ...restLineProps } = getLineProps({ line, key: i });
                
                // Prioritize dynamic step description for the active line, otherwise use static mapping
                const explanation = (isActive && currentStepDescription) 
                  ? currentStepDescription 
                  : lineExplanations[i];

                return (
                  <div
                    key={lineKey || i}
                    {...restLineProps}
                    ref={isActive ? activeLineRef : null}
                    className={`code-line ${isActive ? 'active-line' : ''}`}
                    id={`code-line-${i}`}
                  >
                    <span className="code-line-number">{i + 1}</span>
                    <span className="flex-1 whitespace-pre">
                      {line.map((token, key) => {
                        const { key: tokenKey, ...restTokenProps } = getTokenProps({ token, key });
                        return <span key={tokenKey || key} {...restTokenProps} />;
                      })}
                      {explanation && (
                        <span className="ml-4 inline-flex items-center gap-1.5 opacity-90 transition-all duration-300">
                          <span className="text-[var(--color-accent)] text-[10px] font-mono opacity-60">{"<-"}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 shadow-sm inline-block max-w-[280px] truncate" title={explanation}>
                            {explanation}
                          </span>
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}

export default memo(CodePanel);
