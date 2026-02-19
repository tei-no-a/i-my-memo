export interface Note {
    id: string;
    title: string;
    categories?: string[];
    memoIds: string[];
    createdAt?: string;
    updatedAt?: string;
}
