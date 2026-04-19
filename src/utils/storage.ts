import { BaseDirectory, readTextFile, writeTextFile, exists, remove, mkdir, readDir } from '@tauri-apps/plugin-fs';
import type { DirEntry } from '@tauri-apps/plugin-fs';

const BASE_DIR = BaseDirectory.AppLocalData;
const PATH_PREFIX = import.meta.env.DEV ? 'dev/' : '';

const resolvePath = (path: string): string => `${PATH_PREFIX}${path}`;

export const storage = {
    async exists(path: string): Promise<boolean> {
        try {
            return await exists(resolvePath(path), { baseDir: BASE_DIR });
        } catch (error) {
            console.error(`Failed to check existence of ${path}:`, error);
            return false;
        }
    },

    async readJson<T>(path: string): Promise<T | null> {
        try {
            const content = await readTextFile(resolvePath(path), { baseDir: BASE_DIR });
            return JSON.parse(content) as T;
        } catch (error) {
            console.error(`Failed to read JSON from ${path}:`, error);
            return null;
        }
    },

    async writeJson<T>(path: string, data: T): Promise<boolean> {
        try {
            await writeTextFile(resolvePath(path), JSON.stringify(data, null, 2), { baseDir: BASE_DIR });
            return true;
        } catch (error) {
            console.error(`Failed to write JSON to ${path}:`, error);
            return false;
        }
    },

    async readText(path: string): Promise<string | null> {
        try {
            return await readTextFile(resolvePath(path), { baseDir: BASE_DIR });
        } catch (error) {
            console.error(`Failed to read text from ${path}:`, error);
            return null;
        }
    },

    async writeText(path: string, content: string): Promise<boolean> {
        try {
            await writeTextFile(resolvePath(path), content, { baseDir: BASE_DIR });
            return true;
        } catch (error) {
            console.error(`Failed to write text to ${path}:`, error);
            return false;
        }
    },

    async remove(path: string): Promise<boolean> {
        try {
            await remove(resolvePath(path), { baseDir: BASE_DIR });
            return true;
        } catch (error) {
            console.error(`Failed to remove ${path}:`, error);
            return false;
        }
    },

    async ensureDir(path: string): Promise<boolean> {
        try {
            if (!(await this.exists(path))) {
                await mkdir(resolvePath(path), { baseDir: BASE_DIR, recursive: true });
            }
            return true;
        } catch (error) {
            console.error(`Failed to ensure directory ${path}:`, error);
            return false;
        }
    },

    async list(path: string): Promise<DirEntry[]> {
        try {
            return await readDir(resolvePath(path), { baseDir: BASE_DIR });
        } catch (error) {
            console.error(`Failed to list directory ${path}:`, error);
            return [];
        }
    }
};
