export type CategoryColor = 'rose' | 'sky' | 'amber' | 'emerald' | 'violet';

export interface Category {
    id: number;
    name: string;
    aliases: string[];
    color: CategoryColor;
}
