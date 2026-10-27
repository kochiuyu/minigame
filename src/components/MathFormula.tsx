import React, { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({ math, block = false, className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!math) return '';
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        strict: false,
        output: 'htmlAndMathml'
      });
    } catch (err) {
      console.warn('KaTeX render error:', err);
      return '';
    }
  }, [math, block]);

  if (!renderedHtml) {
    return <span className={`font-mono text-amber-300 ${className}`}>{math}</span>;
  }

  return (
    <span
      className={`katex-wrapper inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

/**
 * Formats a text string by converting any $...$ LaTeX snippets into rendered KaTeX elements
 */
export const FormattedMathText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const parts = useMemo(() => {
    if (!text) return [];
    // Split on single dollar math delimiters, keeping delimiters
    const regex = /(\$[^$]+\$)/g;
    return text.split(regex);
  }, [text]);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const innerMath = part.slice(1, -1);
          // If it's a plain currency like $1 or $10 or $4.50, check if it's math or currency
          if (/^[\d,.]+(\s*each|\s*pts)?$/i.test(innerMath)) {
            return <span key={index} className="font-semibold text-slate-200">${innerMath}</span>;
          }
          return (
            <MathFormula
              key={index}
              math={innerMath}
              className="px-0.5 text-amber-200"
            />
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
