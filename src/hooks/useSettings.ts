import { useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { open } from '@tauri-apps/plugin-dialog';
import { SETTINGS_FILE } from '../constants';
import type { ExportSettings } from '../types';

/** デフォルトのエクスポート設定 */
const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
    memoExportDir: '',
    noteExportDir: '',
};

/**
 * エクスポート設定の読み込み・保存を管理するフック
 *
 * - AppLocalData に settings.json を保存
 * - 起動時に自動読み込み、変更時に自動保存
 */
export function useSettings() {
    const [exportSettings, setExportSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    // 初回読み込み
    useEffect(() => {
        (async () => {
            const saved = await storage.readJson<{ export?: ExportSettings }>(SETTINGS_FILE);
            if (saved?.export) {
                setExportSettings(saved.export);
            }
            setIsLoaded(true);
        })();
    }, []);

    /** エクスポート設定を更新・保存 */
    const updateExportSettings = useCallback(async (update: Partial<ExportSettings>) => {
        const newSettings = { ...exportSettings, ...update };
        setExportSettings(newSettings);

        // settings.json に保存（全体をまとめて保存）
        const current = await storage.readJson<Record<string, unknown>>(SETTINGS_FILE);
        const merged = { ...(current ?? {}), export: newSettings };
        await storage.writeJson(SETTINGS_FILE, merged);
    }, [exportSettings]);

    const selectExportFolder = useCallback(async (key: keyof ExportSettings) => {
        const selected = await open({ directory: true, title: 'エクスポート先フォルダを選択' });
        if (selected) {
            await updateExportSettings({ [key]: selected });
        }
    }, [updateExportSettings]);

    return {
        exportSettings,
        updateExportSettings,
        selectExportFolder,
        isSettingsLoaded: isLoaded,
    };
}
