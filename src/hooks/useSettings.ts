import { useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { open } from '@tauri-apps/plugin-dialog';
import { SETTINGS_FILE } from '../constants';
import type { ExportSettings, AppSettings } from '../types';

/** デフォルトのエクスポート設定 */
const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
    memoExportDir: '',
    noteExportDir: '',
};

/** デフォルトのアプリ設定 */
const DEFAULT_APP_SETTINGS: AppSettings = {
    darkMode: false,
};

/**
 * 設定の読み込み・保存を管理するフック
 *
 * - AppLocalData に settings.json を保存
 * - 起動時に自動読み込み、変更時に自動保存
 */
export function useSettings() {
    const [exportSettings, setExportSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);
    const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    // 初回読み込み
    useEffect(() => {
        (async () => {
            const saved = await storage.readJson<{ export?: ExportSettings, app?: AppSettings }>(SETTINGS_FILE);
            if (saved?.export) {
                setExportSettings(saved.export);
            }
            if (saved?.app) {
                setAppSettings(saved.app);
            }
            setIsLoaded(true);
        })();
    }, []);

    // ダークモードのクラス切り替え
    useEffect(() => {
        if (appSettings.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [appSettings.darkMode]);

    /** エクスポート設定を更新・保存 */
    const updateExportSettings = useCallback(async (update: Partial<ExportSettings>) => {
        const newSettings = { ...exportSettings, ...update };
        setExportSettings(newSettings);

        // settings.json に保存
        const current = await storage.readJson<Record<string, unknown>>(SETTINGS_FILE);
        const merged = { ...(current ?? {}), export: newSettings, app: appSettings };
        await storage.writeJson(SETTINGS_FILE, merged);
    }, [exportSettings, appSettings]);

    /** アプリ設定を更新・保存 */
    const updateAppSettings = useCallback(async (update: Partial<AppSettings>) => {
        const newSettings = { ...appSettings, ...update };
        setAppSettings(newSettings);

        // settings.json に保存
        const current = await storage.readJson<Record<string, unknown>>(SETTINGS_FILE);
        const merged = { ...(current ?? {}), app: newSettings };
        await storage.writeJson(SETTINGS_FILE, merged);
    }, [appSettings]);

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
        appSettings,
        updateAppSettings,
        isSettingsLoaded: isLoaded,
    };
}
