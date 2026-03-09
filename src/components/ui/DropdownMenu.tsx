import { useRef, useEffect } from 'react';

interface DropdownMenuProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

/**
 * 汎用ドロップダウンメニューコンポーネント。
 * メニュー外クリックで自動的に閉じる。
 */
export function DropdownMenu({ isOpen, onClose, children }: DropdownMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-48 bg-theme-card rounded-xl shadow-xl border border-theme-border/50 py-1 z-20 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
        >
            {children}
        </div>
    );
}
