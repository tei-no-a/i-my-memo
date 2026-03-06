import { useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { DEFAULT_KEYBINDINGS, KEYBINDING_FILE } from '../constants';
import type { KeyBinding, ActionName, KeybindingConfig } from '../types';

/** 現在の設定ファイルバージョン */
const CURRENT_VERSION = 1;

/**
 * DEFAULT_KEYBINDINGS に存在するが、保存済みバインドに欠けているアクションを補完する。
 * アプリのアップデートで新ショートカットが追加された場合に対応。
 */
function mergeWithDefaults(saved: KeyBinding[]): KeyBinding[] {
    const savedActions = new Set(saved.map(kb => kb.action));
    const missing = DEFAULT_KEYBINDINGS.filter(kb => !savedActions.has(kb.action));
    return [...saved, ...missing];
}

/**
 * keybinding.json の読み込み・保存を管理するフック
 *
 * - AppLocalData に keybinding.json を保存
 * - 起動時に自動読み込み、ファイルがなければデフォルトで初期化
 * - 変更時に自動保存
 */
export function useKeybindings() {
    const [keybindings, setKeybindings] = useState<KeyBinding[]>(DEFAULT_KEYBINDINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    // 初回読み込み
    useEffect(() => {
        (async () => {
            const saved = await storage.readJson<KeybindingConfig>(KEYBINDING_FILE);

            if (saved?.bindings && Array.isArray(saved.bindings)) {
                // 保存済みバインドにデフォルトの不足分をマージ
                const merged = mergeWithDefaults(saved.bindings);
                setKeybindings(merged);

                // マージで追加があった場合はファイルも更新
                if (merged.length !== saved.bindings.length) {
                    const config: KeybindingConfig = { version: CURRENT_VERSION, bindings: merged };
                    await storage.writeJson(KEYBINDING_FILE, config);
                }
            } else {
                // ファイルが存在しない/不正な場合はデフォルトで初期化
                const config: KeybindingConfig = { version: CURRENT_VERSION, bindings: DEFAULT_KEYBINDINGS };
                await storage.writeJson(KEYBINDING_FILE, config);
            }

            setIsLoaded(true);
        })();
    }, []);

    /** キーバインドを1つ更新して保存 */
    const updateKeybinding = useCallback(async (
        action: ActionName,
        newBinding: Omit<KeyBinding, 'action'>
    ) => {
        const updated = keybindings.map(kb =>
            kb.action === action ? { ...newBinding, action } : kb
        );
        setKeybindings(updated);

        const config: KeybindingConfig = { version: CURRENT_VERSION, bindings: updated };
        await storage.writeJson(KEYBINDING_FILE, config);
    }, [keybindings]);

    /** すべてのキーバインドをデフォルトにリセット */
    const resetKeybindings = useCallback(async () => {
        setKeybindings(DEFAULT_KEYBINDINGS);

        const config: KeybindingConfig = { version: CURRENT_VERSION, bindings: DEFAULT_KEYBINDINGS };
        await storage.writeJson(KEYBINDING_FILE, config);
    }, []);

    return { keybindings, isLoaded, updateKeybinding, resetKeybindings };
}
