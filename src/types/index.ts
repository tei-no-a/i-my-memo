export interface MemoData {
    id: string; // filename
    content: string;
    createdAt: string;
}

export interface Note {
    id: string;
    title: string;
    categories: string[];
    memoIds: string[];
    createdAt: string;
    updatedAt: string;
}
