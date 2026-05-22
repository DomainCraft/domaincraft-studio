import { useState, useRef, useCallback } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ tags, onChange, placeholder = 'Type and press Enter...' }: TagInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback((value: string) => {
    const tag = value.trim();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput('');
  }, [tags, onChange]);

  const removeTag = useCallback((index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  }, [tags, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleAddClick = () => {
    if (input.trim()) {
      addTag(input);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="space-y-1">
      <div
        className="flex flex-wrap gap-1 p-1.5 rounded border bg-transparent min-h-[32px] cursor-text"
        style={{ borderColor: 'hsl(var(--border))' }}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
          >
            {tag}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTag(i);
              }}
              className="hover:text-red-500 transition-colors"
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input.trim()) addTag(input); }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[60px] px-1 py-0.5 text-xs bg-transparent outline-none"
        />
      </div>
      {input.trim() && (
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            handleAddClick();
          }}
          className="flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={10} />
          Add
        </button>
      )}
    </div>
  );
}
