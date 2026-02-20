import { useState, useEffect, useCallback, useRef } from 'react';
import { storage } from '../utils/storage';
import { CATEGORIES_FILE, DEFAULT_CATEGORIES } from '../constants';
import type { Category } from '../types';

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const isLoaded = useRef(false);

    // Load categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const fileExists = await storage.exists(CATEGORIES_FILE);

                if (!fileExists) {
                    await storage.writeJson(CATEGORIES_FILE, DEFAULT_CATEGORIES);
                    setCategories(DEFAULT_CATEGORIES);
                } else {
                    const content = await storage.readJson<Category[]>(CATEGORIES_FILE);
                    setCategories(content || DEFAULT_CATEGORIES);
                }
            } catch (error) {
                console.error('Failed to load categories:', error);
                setCategories(DEFAULT_CATEGORIES);
            }
            isLoaded.current = true;
        };

        loadCategories();
    }, []);

    // Save categories on change
    useEffect(() => {
        if (!isLoaded.current) return;

        storage.writeJson(CATEGORIES_FILE, categories).catch(error => {
            console.error('Failed to save categories:', error);
        });
    }, [categories]);

    const addCategory = useCallback((name: string, color: Category['color']) => {
        setCategories(prev => {
            const nextId = prev.length > 0 ? Math.max(...prev.map(c => c.id)) + 1 : 1;
            return [...prev, { id: nextId, name, color, aliases: [] }];
        });
    }, []);

    const updateCategory = useCallback((id: number, updater: (category: Category) => Partial<Category>) => {
        setCategories(prev => prev.map(cat =>
            cat.id === id ? { ...cat, ...updater(cat) } : cat
        ));
    }, []);

    const deleteCategory = useCallback((id: number) => {
        setCategories(prev => prev.filter(cat => cat.id !== id));
    }, []);

    return {
        categories,
        addCategory,
        updateCategory,
        deleteCategory
    };
}
