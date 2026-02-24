import fs from 'fs';
import path from 'path';

// マッピング定義
const mappings = {
    'CategoryBar': 'Category',
    'CategoryManager': 'Category',
    'ColorPicker': 'Category',
    'Memo': 'Memo',
    'MemoList': 'Memo',
    'DropdownMenu': 'Memo',
    'NoteWorkspace': 'Note',
    'DroppableNoteItem': 'Note',
    'NoteInput': 'Note',
    'Sidebar': 'Layout',
    'Header': 'Layout',
    'FAB': 'Layout',
    'SettingsModal': 'Layout'
};

const srcDir = path.resolve('./src');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walk(dirPath, callback);
        } else {
            if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
                callback(dirPath);
            }
        }
    });
}

function getRelativePath(fromFile, toFile) {
    let rel = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, '/');
    if (!rel.startsWith('.')) rel = './' + rel;
    // .tsx, .tsを取り除く
    rel = rel.replace(/\.tsx?$/, '');
    return rel;
}

// target files for mappings
const targetFiles = {};
for (const [comp, folder] of Object.entries(mappings)) {
    targetFiles[comp] = path.join(srcDir, 'components', folder, `${comp}.tsx`);
}

walk(srcDir, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // 1. App.tsx などのルートからの相対パス
    // 2. 他の components 内あるいは hooks 内からの相対パス
    // そもそも 'lucide-react' などの外部ライブラリ以外を走査して書き換える。

    // インポート文をパースする正規表現: import { X, Y } from 'something';
    const importRegex = /import\s+({[^}]+}|\*\s+as\s+\w+|[\w]+)(?:\s+from)?\s+['"]([^'"]+)['"]/g;

    let newContent = content.replace(importRegex, (match, imports, currentPath) => {
        if (!currentPath.startsWith('.')) return match;

        // currentPath が指す実際の絶対パスを推測する
        let resolvedPath;
        if (currentPath.startsWith('./components/')) {
            // App.tsx用
            const compName = currentPath.split('/').pop().replace('.tsx', '').replace('.ts', '');
            if (mappings[compName]) {
                const newRel = `./components/${mappings[compName]}/${compName}`;
                return `import ${imports} from '${newRel}'`;
            }
        }

        // 同一ディレクトリや別ディレクトリからの相対インポートの場合 (例: './Header', '../hooks/useWorkspace')
        const absImportPathTsx = path.resolve(path.dirname(filePath), currentPath + '.tsx');
        const absImportPathTs = path.resolve(path.dirname(filePath), currentPath + '.ts');
        const absImportPathDir = path.resolve(path.dirname(filePath), currentPath, 'index.ts');

        // もし現在のコンポーネント同士のインポートだったら、新しいパスに修正する
        const compName = currentPath.split('/').pop();
        if (mappings[compName]) {
            // かつて components 直下にあったファイルを参照している場合
            // 移動後の正当なパスを計算
            const correctAbsPath = targetFiles[compName];
            const newRel = getRelativePath(filePath, correctAbsPath);
            return `import ${imports} from '${newRel}'`;
        }

        // hook/utilsなどへの参照の修正（コンポーネントが一段深くなったため ../ が ../../ になるなど）
        // hooks / constants / types / utils に依存しているかチェック
        const originalDir = path.resolve(srcDir, 'components');
        // 移動したファイル自身からのインポート
        if (filePath.includes(path.join('src', 'components'))) {
            if (currentPath.startsWith('../') || currentPath.startsWith('./')) {
                // check if it refers to hooks, types, constants, utils
                if (currentPath.includes('hooks') || currentPath.includes('types') || currentPath.includes('constants') || currentPath.includes('utils')) {
                    // if it was '../hooks/something' from src/components/Sidebar.tsx
                    // now Sidebar.tsx is src/components/Layout/Sidebar.tsx
                    // so it should be '../../hooks/something'
                    // Since we know the old code used '../X', we just need to add one more '../' if it's in a subfolder
                    // The node script runs against current files. The currentPath is old code string like '../hooks/useX'
                    // Because the file is now 1 level deeper, relative paths starting with '../' which targeted src/ or similar need another '../'.
                    return `import ${imports} from '../${currentPath}'`;
                }
            }
        }

        return match;
    });

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`Updated ${filePath}`);
    }
});
