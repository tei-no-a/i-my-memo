import { useState, useEffect, useCallback, useRef } from 'react';
import type { KeyBinding, ActionName } from '../../types';

/** アクション名 → 日本語ラベル */
const ACTION_LABELS: Record<ActionName, string> = {
    createMemo: '新規メモ作成',
    createTaskList: 'タスクリスト作成',
    exportMemo: 'メモをエクスポート',
    deleteMemo: 'メモを削除',
    copyMemo: 'メモ全文をコピー',
    addNote: 'ノートを追加',
    openBoard: 'ボードを開く',
};

/** KeyBinding を人間が読める文字列にフォーマット */
function formatKeybinding(kb: KeyBinding): string {
    const parts: string[] = [];
    if (kb.ctrlKey) parts.push('Ctrl');
    if (kb.shiftKey) parts.push('Shift');
    if (kb.altKey) parts.push('Alt');

    // キー名の表示を読みやすく
    let keyLabel = kb.key;
    if (kb.key === ' ') keyLabel = 'Space';
    else if (kb.key.length === 1) keyLabel = kb.key.toUpperCase();

    parts.push(keyLabel);
    return parts.join(' + ');
}

interface KeybindingSettingsProps {
    keybindings: KeyBinding[];
    onUpdateKeybinding: (action: ActionName, newBinding: Omit<KeyBinding, 'action'>) => Promise<void>;
    onResetKeybindings: () => Promise<void>;
}

export function KeybindingSettings({
    keybindings,
    onUpdateKeybinding,
    onResetKeybindings,
}: KeybindingSettingsProps) {
    // 現在キーバインド録入力中のアクション名（null = 録入力モードではない）
    const [recordingAction, setRecordingAction] = useState<ActionName | null>(null);
    const recordingRef = useRef<ActionName | null>(null);

    // recordingAction をref にも同期（keydown ハンドラ内で最新値を参照するため）
    useEffect(() => {
        recordingRef.current = recordingAction;
    }, [recordingAction]);

    /** キー入力を受け取り、新しいバインドとして設定 */
    const handleKeyCapture = useCallback((e: KeyboardEvent) => {
        const action = recordingRef.current;
        if (!action) return;

        // 修飾キー単体の入力は無視
        if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

        e.preventDefault();
        e.stopPropagation();

        const newBinding: Omit<KeyBinding, 'action'> = {
            key: e.key,
            ...(e.ctrlKey || e.metaKey ? { ctrlKey: true } : {}),
            ...(e.shiftKey ? { shiftKey: true } : {}),
            ...(e.altKey ? { altKey: true } : {}),
        };

        onUpdateKeybinding(action, newBinding);
        setRecordingAction(null);
    }, [onUpdateKeybinding]);

    // 録入力モード中のグローバルキーダウンリスナー
    useEffect(() => {
        if (recordingAction) {
            window.addEventListener('keydown', handleKeyCapture, true);
            return () => window.removeEventListener('keydown', handleKeyCapture, true);
        }
    }, [recordingAction, handleKeyCapture]);

    /** 録入力モードの開始/キャンセル */
    const toggleRecording = useCallback((action: ActionName) => {
        setRecordingAction(prev => (prev === action ? null : action));
    }, []);

    return (
        <div className="h-full overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-theme-fg">Keyboard Shortcuts</h3>
                <button
                    onClick={onResetKeybindings}
                    className="text-xs text-theme-fg/50 hover:text-theme-accent transition-colors"
                >
                    デフォルトに戻す
                </button>
            </div>

            <div className="space-y-2">
                {keybindings.map(kb => {
                    const isRecording = recordingAction === kb.action;

                    return (
                        <div
                            key={kb.action}
                            className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-theme-bg-soft/50 transition-colors"
                        >
                            {/* アクション名 */}
                            <span className="text-sm text-theme-fg/80 font-medium">
                                {ACTION_LABELS[kb.action] ?? kb.action}
                            </span>

                            {/* キーバインド表示 / 録入力ボタン */}
                            <button
                                onClick={() => toggleRecording(kb.action)}
                                className={`
                                    min-w-[140px] px-3 py-1.5 rounded-lg text-sm font-mono text-center transition-all
                                    ${isRecording
                                        ? 'bg-theme-accent/20 text-theme-accent border border-theme-accent/50 animate-pulse'
                                        : 'bg-theme-bg-soft text-theme-fg/70 border border-theme-border/50 hover:border-theme-accent/40 hover:text-theme-fg'
                                    }
                                `}
                            >
                                {isRecording ? 'キーを入力...' : formatKeybinding(kb)}
                            </button>
                        </div>
                    );
                })}
            </div>

            <p className="text-xs text-theme-fg/40">
                変更したいショートカットをクリックしてから、新しいキーの組み合わせを入力してください。
            </p>
        </div>
    );
}
