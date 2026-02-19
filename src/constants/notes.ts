import type { Note } from '../types';

export const NOTES_FILE = 'notes.json';
export const MEMO_DIR = 'memos';

export const SPECIAL_NOTE_IDS = {
    BOARD: 'board',
    TRASH: 'trash',
} as const;

export const DEFAULT_NOTES: Note[] = [
    {
        id: SPECIAL_NOTE_IDS.BOARD,
        title: 'Board',
        memoIds: []
    },
    {
        id: SPECIAL_NOTE_IDS.TRASH,
        title: 'Trash',
        memoIds: []
    },
    {
        id: '1739000000001',
        title: 'Ideas',
        categories: [],
        memoIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '1739000000002',
        title: 'Work',
        categories: [],
        memoIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];
