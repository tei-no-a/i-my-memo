/** エクスポート先フォルダの設定 */
export interface ExportSettings {
    /** メモエクスポート先フォルダのパス */
    memoExportDir: string;
    /** ノートエクスポート先フォルダのパス */
    noteExportDir: string;
}

/** アプリ全般の設定 */
export interface AppSettings {
    /** ダークモードが有効かどうか */
    darkMode: boolean;
}
