import { useState, useCallback, useEffect } from 'react';

// ヘルパー関数: テキストエリア内のカーソルのY座標（上端からの相対位置）を正確に計算する
// field-sizingなどで高さが伸縮する場合でも、内部の改行や折り返し座標を取得できます
function getCaretY(element: HTMLTextAreaElement, position: number): number {
    const div = document.createElement('div');
    const style = window.getComputedStyle(element);

    // スクロール位置のズレを生じさせないため、サイズ計算に関連するスタイルを完全に複製
    ['boxSizing', 'width', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
        'textIndent', 'whiteSpace', 'wordBreak'].forEach(prop => {
            div.style[prop as any] = style[prop as any];
        });

    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';

    // カーソル位置までのテキストを格納
    div.textContent = element.value.substring(0, position);

    // カーソル位置の要素（これのY座標を測る）
    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);

    document.body.appendChild(div);
    const y = span.offsetTop;
    document.body.removeChild(div);

    return y;
}

export function useTypewriterScroll(scrollContainerRef: React.RefObject<HTMLElement | null>) {
    const [focusedMemoId, setFocusedMemoId] = useState<string | null>(null);

    const handleMemoFocus = useCallback((id: string) => {
        setFocusedMemoId(id);
    }, []);

    const handleMemoBlur = useCallback(() => {
        setFocusedMemoId(null);
    }, []);

    const adjustScroll = useCallback(() => {
        if (!focusedMemoId || !scrollContainerRef.current) return;

        const textarea = document.querySelector(`#memo-${focusedMemoId} textarea`) as HTMLTextAreaElement;
        if (!textarea) return;

        const cursorRelativeY = getCaretY(textarea, textarea.selectionStart);
        const rect = textarea.getBoundingClientRect();

        // 画面（ビューポート）上でのカーソルの絶対Y座標
        const cursorAbsoluteY = rect.top + cursorRelativeY;

        // 目標位置（画面の下から40%付近）
        // FABや余白と被らず、スムーズに入力できる目線の高さ
        const targetY = window.innerHeight * 0.55;

        const diff = cursorAbsoluteY - targetY;

        // ズレが数ピクセル以上ある場合のみスクロール（微小な揺れを防ぐ）
        if (Math.abs(diff) > 4) {
            scrollContainerRef.current.scrollBy({ top: diff, behavior: 'auto' });
        }
    }, [focusedMemoId, scrollContainerRef]);

    useEffect(() => {
        if (!focusedMemoId) return;

        const textarea = document.querySelector(`#memo-${focusedMemoId} textarea`) as HTMLTextAreaElement;
        if (!textarea) return;

        const handleEvent = () => {
            // textareaの高さの再計算（field-sizing対応）が終わるのを待ってからスクロール調整
            requestAnimationFrame(adjustScroll);
        };

        // 文字入力や改行、カーソル移動時に追従させる
        textarea.addEventListener('input', handleEvent);
        textarea.addEventListener('keyup', handleEvent);
        textarea.addEventListener('click', handleEvent);

        // 初回フォーカス時も少し遅らせて位置調整
        setTimeout(adjustScroll, 50);

        return () => {
            textarea.removeEventListener('input', handleEvent);
            textarea.removeEventListener('keyup', handleEvent);
            textarea.removeEventListener('click', handleEvent);
        };
    }, [focusedMemoId, adjustScroll]);

    return {
        focusedMemoId,
        handleMemoFocus,
        handleMemoBlur
    };
}
