import { useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { Sidebar } from './components/Layout/Sidebar';
import { NoteWorkspace } from './components/Note/NoteWorkspace';
import { useWorkspace } from './hooks/useWorkspace';
import { useSettings } from './hooks/useSettings';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { SettingsModal } from './components/Settings/SettingsModal';
import { SPECIAL_NOTE_IDS } from './constants';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [focusedMemoId, setFocusedMemoId] = useState<string | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const { exportSettings, selectExportFolder, appSettings, updateAppSettings } = useSettings();

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
    switchMemoType,
    deleteMemo,
    exportMemo,
    exportNote,
    emptyTrash,
    reorderMemos,
    reorderNotes,
    moveMemoToNote,
    keybindings,
    updateKeybinding,
    resetKeybindings
  } = useWorkspace(exportSettings, !isSettingsOpen, focusedMemoId, () => setIsCreatingNote(true));

  const {
    activeDragMemo,
    activeDragNote,
    collisionDetection,
    onDragStart,
    onDragEnd,
    onDragCancel,
  } = useDragAndDrop({ memos, activeNote, activeNoteId, notes, reorderMemos, reorderNotes, moveMemoToNote });

  const isSpecialNote = activeNoteId === SPECIAL_NOTE_IDS.BOARD || activeNoteId === SPECIAL_NOTE_IDS.TRASH;

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
          isCreatingNote={isCreatingNote}
          onSetCreatingNote={setIsCreatingNote}
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
          onCreateTaskList={() => createMemo(undefined, 'tasklist')}
          onUpdateMemo={updateMemo}
          onSwitchMemoType={switchMemoType}
          onDuplicateMemo={duplicateMemo}
          onDeleteMemo={deleteMemo}
          onExportMemo={exportMemo}
          onEmptyTrash={emptyTrash}
          onExportNote={exportNote}
          onReturnToBoard={(memoId) => moveMemoToNote(memoId, SPECIAL_NOTE_IDS.BOARD)}
          onMemoFocus={setFocusedMemoId}
          onMemoBlur={() => setFocusedMemoId(null)}
        />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDragMemo ? (
          <div className="w-80 bg-theme-card rounded-2xl shadow-xl border border-theme-accent/30 opacity-80 p-4 text-sm text-theme-fg truncate pointer-events-none">
            {activeDragMemo.content || 'Empty memo'}
          </div>
        ) : activeDragNote ? (
          <div className="w-56 bg-theme-bg-soft rounded-lg shadow-xl border border-theme-accent/30 opacity-90 px-3 py-2 text-xs text-theme-fg flex items-center gap-2 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-theme-accent"></span>
            {activeDragNote.title}
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
        onSelectExportFolder={selectExportFolder}
        darkMode={appSettings.darkMode}
        onToggleDarkMode={(darkMode) => updateAppSettings({ darkMode })}
        keybindings={keybindings}
        onUpdateKeybinding={updateKeybinding}
        onResetKeybindings={resetKeybindings}
      />
    </DndContext>
  );
}

export default App;
