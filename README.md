# I My Memo

「あいまいでもメモが書ける」をコンセプトにした、Windows 向けの軽量デスクトップメモアプリです。複数のメモをノート単位でまとめ、カテゴリで横断的に分類して、必要に応じて Markdown としてエクスポートできます。メモデータはすべてローカルに保存され、クラウド同期は行いません。

- 対応 OS: Windows（Tauri のバンドルターゲット上は他 OS でもビルド可能）
- 技術スタック: Tauri 2 + React 19 + TypeScript + Tailwind CSS

## デモ

<img width="802" height="632" alt="Image" src="https://github.com/user-attachments/assets/560350e4-5b51-4c3c-ad65-ba1c094b6f70" />

## 主な特徴

- **高速起動・即メモ開始** — 起動してすぐに書き始められる軽量設計
- **ノート／メモ／カテゴリの3層構成** — メモをノートに束ね、ノートにカテゴリを付与して分類
- **ドラッグ&ドロップ操作** — `dnd-kit` による直感的な並べ替え
- **テキスト／タスクリスト の 2 形式** — 同じメモカードでチェックリストも作成可能
- **自動保存** — 明示的な保存操作は不要。変更は即座にローカルファイルへ反映
- **Markdown エクスポート** — ノート全体、あるいは単体メモをエクスポート
- **キーボードショートカット** — よく使う操作は設定画面からカスタマイズ可能
- **ライト／ダークテーマ** — CSS 変数ベースのテーマ切り替え

## 動作要件

- [Node.js](https://nodejs.org/) 18 以降（推奨 LTS）
- [Rust](https://www.rust-lang.org/) 1.77.2 以降（Tauri ビルド用）
- Windows 向けの [Tauri 前提環境](https://tauri.app/start/prerequisites/)（Microsoft Edge WebView2、Visual Studio Build Tools など）

## セットアップ

```bash
# 依存パッケージのインストール
npm install
```

## 開発コマンド

| コマンド | 用途 |
|---------|------|
| `npm run dev` | Vite の開発サーバを起動（ブラウザ確認用） |
| `npm run tauri dev` | Tauri デスクトップアプリとして開発起動 |
| `npm run build` | TypeScript 型チェック + フロントエンドのプロダクションビルド |
| `npm run tauri build` | デスクトップアプリのインストーラを生成 |
| `npm run lint` | ESLint 実行 |
| `npm run preview` | ビルド後のフロントエンドをローカルプレビュー |

## プロジェクト構成（抜粋）

```
i-my-memo/
├── src/                  React フロントエンド
│   ├── components/       UIコンポーネント（Category / Layout / Memo / Note / Settings / ui）
│   ├── hooks/            カスタムフック（状態管理・ファイルI/O・DnD・ショートカット）
│   ├── types/            TypeScript 型定義
│   ├── utils/            エクスポート・ストレージ・メモ操作ユーティリティ
│   ├── constants/        定数（カテゴリ色・キーバインド・固定ノートID など）
│   └── App.tsx           ルートコンポーネント
├── src-tauri/            Rust バックエンド（Tauri 設定・プラグイン初期化）
├── docs/                 仕様書・計画書
└── public/               静的アセット
```

## データの保存場所

Tauri の `AppLocalData` 配下に保存されます。

Windows の場合: `C:\Users\{ユーザー名}\AppData\Local\com.imymemo.app\`

```
AppLocalData/
├── notes.json          ノート一覧（構造・順序・カテゴリ割り当て）
├── categories.json     カテゴリ定義
├── settings.json       エクスポート先・ダークモードなどの設定
├── keybinding.json     カスタムキーバインディング
└── memos/              メモ本文（1 メモ 1 ファイル、Markdown）
```

メモ本文のファイル名は作成日時（`YYYY-MM-DD-HH-mm-ss.md`）になっています。タスクリスト形式のメモは先頭行に `<!--tasklist-->` マーカーが付きます。

## Obsidian などとの連携

エクスポート先フォルダを設定画面から指定することで、任意の Vault / フォルダに Markdown として書き出せます。

- **ノート単位の書き出し**: YAML frontmatter 付きの単一 Markdown ファイル
- **メモ単位の追記**: 日付ファイル（デイリーノート）に追記
- **タスクリスト**: `- [ ]` / `- [x]` 形式のチェックリストに変換

## デフォルトのキーボードショートカット

| 操作 | ショートカット |
|------|--------------|
| 新規メモ作成 | `Ctrl + Enter` |
| メモ削除 | `Ctrl + D` |
| 新規ノート作成 | `Ctrl + N` |

その他のショートカットおよびカスタマイズは、アプリ内の設定モーダルから行えます。

## ライセンス

本リポジトリのソースコードの著作権は作者に帰属します（All rights reserved）。
ポートフォリオおよびバックアップ目的で公開しているもので、再配布や商用利用は想定していません。
閲覧・学習目的での参照は歓迎します。
