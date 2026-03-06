/** アクションの種類を文字列ユニオンで定義 */
export type ActionName = 'createMemo' | 'exportMemo' | 'deleteMemo' | 'copyMemo';


/** キーバインドの1エントリ */
export interface KeyBinding {
    key: string;        // KeyboardEvent.key の値（例: 'Enter', 'd'）
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    action: ActionName;
}

/** keybinding.json 全体の型 */
export interface KeybindingConfig {
    version: number;
    bindings: KeyBinding[];
}
