import { useRef, useEffect, useCallback } from 'react';

interface TaskItem {
    checked: boolean;
    text: string;
}

function parseTaskList(content: string): TaskItem[] {
    if (!content.trim()) return [{ checked: false, text: '' }];
    return content.split('\n').map(line => {
        if (line.startsWith('[x] ')) return { checked: true, text: line.slice(4) };
        if (line.startsWith('[ ] ')) return { checked: false, text: line.slice(4) };
        return { checked: false, text: line };
    });
}

function serializeTaskList(tasks: TaskItem[]): string {
    return tasks.map(t => `[${t.checked ? 'x' : ' '}] ${t.text}`).join('\n');
}

interface TaskListContentProps {
    content: string;
    onChange: (newContent: string) => void;
    autoFocus?: boolean;
    onFocus: () => void;
    onBlur: () => void;
}

export function TaskListContent({ content, onChange, autoFocus, onFocus, onBlur }: TaskListContentProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const blurTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const focusIndexRef = useRef<number | null>(null);

    const tasks = parseTaskList(content);

    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0].focus({ preventScroll: true });
        }
    }, [autoFocus]);

    // フォーカスがタスク間で移動する際にblurが発火しないようにする
    const handleFocusCapture = useCallback(() => {
        clearTimeout(blurTimeoutRef.current);
        onFocus();
    }, [onFocus]);

    const handleBlurCapture = useCallback(() => {
        blurTimeoutRef.current = setTimeout(() => {
            onBlur();
        }, 0);
    }, [onBlur]);

    // フォーカス後にrefのインデックスを合わせる
    useEffect(() => {
        if (focusIndexRef.current !== null) {
            const idx = focusIndexRef.current;
            focusIndexRef.current = null;
            requestAnimationFrame(() => {
                inputRefs.current[idx]?.focus();
            });
        }
    });

    const toggleCheck = (index: number) => {
        const updated = [...tasks];
        updated[index] = { ...updated[index], checked: !updated[index].checked };
        onChange(serializeTaskList(updated));
    };

    const updateText = (index: number, text: string) => {
        const updated = [...tasks];
        updated[index] = { ...updated[index], text };
        onChange(serializeTaskList(updated));
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const updated = [...tasks];
            updated.splice(index + 1, 0, { checked: false, text: '' });
            focusIndexRef.current = index + 1;
            onChange(serializeTaskList(updated));
        }
        if (e.key === 'Backspace' && tasks[index].text === '' && tasks.length > 1) {
            e.preventDefault();
            const updated = [...tasks];
            updated.splice(index, 1);
            focusIndexRef.current = Math.max(0, index - 1);
            onChange(serializeTaskList(updated));
        }
    };

    return (
        <div
            className="p-4 space-y-1 rounded-b-2xl"
            onFocusCapture={handleFocusCapture}
            onBlurCapture={handleBlurCapture}
        >
            {tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-3 group/task">
                    <label className="relative w-4 h-4 flex-shrink-0 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={task.checked}
                            onChange={() => toggleCheck(i)}
                            className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            task.checked
                                ? 'bg-theme-accent border-theme-accent'
                                : 'bg-theme-card dark:bg-theme-bg-soft border-theme-border'
                        }`}>
                            {task.checked && (
                                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                                    <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            )}
                        </div>
                    </label>
                    <input
                        ref={el => { inputRefs.current[i] = el; }}
                        type="text"
                        value={task.text}
                        onChange={(e) => updateText(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        placeholder="New task..."
                        className={`flex-1 bg-transparent focus:outline-none text-[18px] leading-relaxed placeholder:text-theme-fg/30 ${
                            task.checked
                                ? 'line-through text-theme-fg/40'
                                : 'text-theme-fg'
                        }`}
                    />
                </div>
            ))}
        </div>
    );
}
