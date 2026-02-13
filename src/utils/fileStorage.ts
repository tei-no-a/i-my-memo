import { BaseDirectory, readDir, readTextFile, writeTextFile, remove, exists, mkdir } from '@tauri-apps/plugin-fs';

const SUBDIR = 'memos';

export interface MemoData {
    id: string; // filename
    content: string;
    createdAt: string;
}

async function ensureMemosDirectory() {
    try {
        const dirExists = await exists(SUBDIR, { baseDir: BaseDirectory.AppLocalData });
        if (!dirExists) {
            console.log('Creating memos directory...');
            await mkdir(SUBDIR, { baseDir: BaseDirectory.AppLocalData, recursive: true });
        }
    } catch (error) {
        console.error('Error ensuring memos directory:', error);
        throw error;
    }
}

// Generate filename from date (YYYY-MM-DD-HH-mm-ss.md)
function generateFilename(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}.md`;
}

function parseFilename(filename: string): { id: string; createdAt: string } {
    const name = filename.replace('.md', '');
    const parts = name.split('-');

    if (parts.length >= 6) {
        const [year, month, day, hour, minute, second] = parts;
        return {
            id: filename,
            createdAt: `${year}/${month}/${day} ${hour}:${minute}:${second}`
        };
    }
    return { id: filename, createdAt: 'Unknown' };
}

export async function saveMemo(content: string, existingId?: string): Promise<MemoData> {
    await ensureMemosDirectory();

    let filename = existingId;
    let createdAt = '';

    if (!filename) {
        const now = new Date();
        filename = generateFilename(now);
    }

    // Always recalculate/fetch createdAt from filename to ensure consistency
    createdAt = parseFilename(filename).createdAt;

    await writeTextFile(`${SUBDIR}/${filename}`, content, { baseDir: BaseDirectory.AppLocalData });

    return {
        id: filename,
        content,
        createdAt
    };
}

export async function loadMemos(): Promise<MemoData[]> {
    await ensureMemosDirectory();
    // readDir returns distinct types on different desktop/mobile, simplified here for desktop
    const entries = await readDir(SUBDIR, { baseDir: BaseDirectory.AppLocalData });

    const memos: MemoData[] = [];

    for (const entry of entries) {
        if (entry.isFile && entry.name.endsWith('.md')) {
            try {
                const content = await readTextFile(`${SUBDIR}/${entry.name}`, { baseDir: BaseDirectory.AppLocalData });
                const { id, createdAt } = parseFilename(entry.name);
                memos.push({
                    id,
                    content,
                    createdAt
                });
            } catch (e) {
                console.error(`Failed to read memo ${entry.name}:`, e);
            }
        }
    }

    return memos.sort((a, b) => b.id.localeCompare(a.id));
}

export async function deleteMemo(id: string): Promise<void> {
    await ensureMemosDirectory();
    await remove(`${SUBDIR}/${id}`, { baseDir: BaseDirectory.AppLocalData });
}
