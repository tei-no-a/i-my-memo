import type { KeyBinding } from '../types/keybindings';

/** キーバインド設定ファイルのパス（AppLocalData配下） */
export const KEYBINDING_FILE = 'keybinding.json';

export const DEFAULT_KEYBINDINGS: KeyBinding[] = [
    { key: 'Enter', ctrlKey: true, action: 'createMemo' },
    { key: 'Enter', altKey: true, action: 'exportMemo' },
    { key: 'd', ctrlKey: true, action: 'deleteMemo' },
    { key: 'm', ctrlKey: true, action: 'copyMemo' },
    { key: 'n', ctrlKey: true, action: 'addNote' },
    { key: 'b', ctrlKey: true, action: 'openBoard' },
];
