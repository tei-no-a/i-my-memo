import { useState, useMemo } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { Sidebar } from './components/Layout/Sidebar';
import { NoteWorkspace } from './components/Note/NoteWorkspace';
import { useWorkspace } from './hooks/useWorkspace';
import { useSettings } from './hooks/useSettings';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { SettingsModal } from './components/Layout/SettingsModal';
import { SPECIAL_NOTE_IDS, DEFAULT_KEYBINDINGS } from './constants';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { exportSettings, updateExportSettings } = useSettings();

  const {
    notes,
    activeNote,
    activeNoteId,
    selectNote,
    addNote,
    renameNote,
    deleteNote,
    toggleCategory,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    memos,
    isLoadingMemos,
    lastCreatedId,
    createMemo,
    duplicateMemo,
    updateMemo,
    deleteMemo,
    exportMemo,
    exportNote,
    emptyTrash,
    reorderMemos,
    moveMemoToNote
  } = useWorkspace(exportSettings);

  const {
    activeDragMemo,
    collisionDetection,
    onDragStart,
    onDragEnd,
    onDragCancel,
  } = useDragAndDrop({ memos, activeNote, activeNoteId, reorderMemos, moveMemoToNote });

  const isSpecialNote = activeNoteId === SPECIAL_NOTE_IDS.BOARD || activeNoteId === SPECIAL_NOTE_IDS.TRASH;

  const actionHandlers = useMemo(() => ({
    createMemo,
    exportMemo: () => {
      if (memos.length > 0) {
        exportMemo(memos[memos.length - 1].id);
      }
    },
    deleteMemo: () => {
      if (memos.length > 0) {
        deleteMemo(memos[memos.length - 1].id);
      }
    },
  }), [createMemo, exportMemo, deleteMemo, memos]);

  useKeyboardShortcuts(DEFAULT_KEYBINDINGS, actionHandlers, !isSettingsOpen);

  return (
    <DndContext
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="flex h-screen bg-theme-bg overflow-hidden text-theme-fg font-sans selection:bg-theme-accent/30">
        <Sidebar
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={selectNote}
          onAddNote={addNote}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <NoteWorkspace
          activeNote={activeNote}
          isSpecialNote={isSpecialNote}
          isTrashNote={activeNoteId === SPECIAL_NOTE_IDS.TRASH}
          categories={categories}
          memos={memos}
          isLoadingMemos={isLoadingMemos}
          lastCreatedId={lastCreatedId}
          onDeleteNote={() => deleteNote(activeNoteId)}
          onRenameNote={(newTitle) => renameNote(activeNoteId, newTitle)}
          onToggleCategory={(categoryId) => toggleCategory(activeNoteId, categoryId)}
          onCreateMemo={createMemo}
          onUpdateMemo={updateMemo}
          onDuplicateMemo={duplicateMemo}
          onDeleteMemo={deleteMemo}
          onExportMemo={exportMemo}
          onEmptyTrash={emptyTrash}
          onExportNote={exportNote}
          onReturnToBoard={(memoId) => moveMemoToNote(memoId, SPECIAL_NOTE_IDS.BOARD)}
        />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDragMemo ? (
          <div className="w-80 bg-white rounded-2xl shadow-xl border border-theme-accent/30 opacity-80 p-4 text-sm text-theme-fg truncate pointer-events-none">
            {activeDragMemo.content || 'Empty memo'}
          </div>
        ) : null}
      </DragOverlay>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        categories={categories}
        onAddCategory={addCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
        exportSettings={exportSettings}
        onUpdateExportSettings={updateExportSettings}
      />
    </DndContext>
  );
}

export default App;
