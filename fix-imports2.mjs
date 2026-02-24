import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('./src/components');

function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walk(dirPath);
        } else if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
            let content = fs.readFileSync(dirPath, 'utf-8');
            let original = content;

            // Fix ../types, ../constants, ../hooks, ../utils -> ../../types etc.
            content = content.replace(/from '..\/(types|constants|hooks|utils)'/g, "from '../../$1'");
            content = content.replace(/from '..\/(types|constants|hooks|utils)\/(.*?)'/g, "from '../../$1/$2'");

            // Sidebar.tsx
            content = content.replace(/from '\.\/DroppableNoteItem'/g, "from '../Note/DroppableNoteItem'");
            content = content.replace(/from '\.\/NoteInput'/g, "from '../Note/NoteInput'");

            // NoteWorkspace.tsx
            content = content.replace(/from '\.\/Header'/g, "from '../Layout/Header'");
            content = content.replace(/from '\.\/CategoryBar'/g, "from '../Category/CategoryBar'");
            content = content.replace(/from '\.\/MemoList'/g, "from '../Memo/MemoList'");
            content = content.replace(/from '\.\/FAB'/g, "from '../Layout/FAB'");

            // CategoryManager.tsx
            // content = content.replace(/from '\.\/ColorPicker'/g, "from './ColorPicker'"); // Already correct

            // Header.tsx -> DropdownMenu
            content = content.replace(/from '\.\/DropdownMenu'/g, "from '../Memo/DropdownMenu'");

            // DropdownMenu inside DroppableNoteItem ?
            // DropdownMenu is now in Memo/DropdownMenu

            if (content !== original) {
                fs.writeFileSync(dirPath, content, 'utf-8');
                console.log('Fixed', dirPath);
            }
        }
    });
}
walk(srcDir);
