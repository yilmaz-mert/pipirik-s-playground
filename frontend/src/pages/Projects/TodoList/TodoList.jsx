import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TodoItem from './TodoItem';
import 'drag-drop-touch';

const getNow = () => Date.now();

function TodoList() {
  const { t } = useTranslation();
  /* --- STATE MANAGEMENT --- */
  
  // Initialize todos from localStorage or empty array
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("pipirik-todos");
    return saved ? JSON.parse(saved) : [];
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, _setPageSize] = useState(8);

  // Sayfa numaralarını hesaplayan yardımcı fonksiyon
  const getPageRange = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);

    if (current <= 3) return [0, 1, 2, 3, 4, '...', total - 1];
    if (current >= total - 4) return [0, '...', total - 5, total - 4, total - 3, total - 2, total - 1];

    return [0, '...', current - 1, current, current + 1, '...', total - 1];
  };

  const [draggedItemId, setDraggedItemId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [newText, setNewText] = useState("");
  
  // Refs to track taps and touch duration per-item on mobile devices
  const touchStart = useRef({});
  const lastToggle = useRef({});
  const lastGlobalTap = useRef({ id: null, time: 0 });
  const lastTouchAt = useRef(0);
  const textareaRef = useRef(null);
  const liRefs = useRef({});

  /* --- EFFECTS --- */

  // Sync todos to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem("pipirik-todos", JSON.stringify(todos));
  }, [todos]);

  // Toggle the completion status of a task
  const toggleComplete = useCallback((id, timeStamp) => {
    if (timeStamp == null) return;
    const now = timeStamp;
    const last = lastToggle.current[id] || 0;
    if (now - last < 400) return;
    lastToggle.current[id] = now;

    setTodos(prevTodos => prevTodos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, [setTodos]);

  // Special double-tap handler for mobile users to toggle completion
  const handleTouchComplete = useCallback((e, id) => {
    const now = e.timeStamp ?? getNow();
    const start = (touchStart.current && touchStart.current[id]) || 0;
    const duration = now - start;
    const LONG_PRESS_THRESHOLD = 250;
    const DOUBLE_PRESS_DELAY = 300;

    if (duration > LONG_PRESS_THRESHOLD) {
      if (touchStart.current) touchStart.current[id] = 0;
      return;
    }

    const last = lastGlobalTap.current || { id: null, time: 0 };
    if (last.id === id && now - last.time < DOUBLE_PRESS_DELAY) {
      toggleComplete(id, now);
      lastGlobalTap.current = { id: null, time: 0 };
    } else {
      lastGlobalTap.current = { id, time: now };
    }

    if (touchStart.current) touchStart.current[id] = 0;
    lastTouchAt.current = now;
  }, [toggleComplete]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      const val = (event.currentTarget && event.currentTarget.value) ? event.currentTarget.value : '';
      if (val.trim() !== "") {
        const newTodo = { id: getNow(), text: val.trim(), completed: false };
        setTodos(prev => {
          const newList = [...prev, newTodo];
          setCurrentPage(Math.ceil(newList.length / pageSize) - 1);
          return newList;
        });
      }
      event.preventDefault();
      setNewText('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  }, [setTodos, pageSize]);

  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }, []);

  const addTodo = useCallback(() => {
    const ta = textareaRef.current;
    const val = (ta && typeof ta.value === 'string') ? ta.value.trim() : '';
    if (val === '') return;
    const newTodo = { id: getNow(), text: val, completed: false };
    setTodos(prev => {
      const newList = [...prev, newTodo];
      setCurrentPage(Math.ceil(newList.length / pageSize) - 1);
      return newList;
    });
    setNewText('');
    if (ta) ta.style.height = 'auto';
  }, [setTodos, pageSize]);

  // clearAll functionality removed

  // Trigger delete animation and then remove the item
  const deleteTodo = useCallback((id) => {
    const el = liRefs.current && liRefs.current[id];
    const ANIM_DURATION = 400;
    if (el) {
      // prepare for animation
      el.style.overflow = 'hidden';
      const startHeight = el.offsetHeight;
      el.style.height = `${startHeight}px`;
      // force reflow
      // eslint-disable-next-linetypescript-eslint/no-unused-expressions
      el.offsetHeight;
      el.style.transition = `height ${ANIM_DURATION}ms ease, opacity ${ANIM_DURATION}ms ease, margin ${ANIM_DURATION}ms ease, transform ${ANIM_DURATION}ms ease`;
      el.style.height = '0px';
      el.style.opacity = '0';
      el.style.marginBottom = '0px';
      el.style.transform = 'scale(0.98)';
      // remove from state after animation
      setTimeout(() => {
        setTodos(prevTodos => {
          const newList = prevTodos.filter((t) => t.id !== id);
          setCurrentPage(curr => Math.min(curr, Math.max(0, Math.ceil(newList.length / pageSize) - 1)));
          return newList;
        });
        // cleanup
        delete liRefs.current[id];
      }, ANIM_DURATION);
    } else {
      // fallback
      setDeletingId(id);
      setTimeout(() => {
        setTodos(prevTodos => {
          const newList = prevTodos.filter((t) => t.id !== id);
          setCurrentPage(curr => Math.min(curr, Math.max(0, Math.ceil(newList.length / pageSize) - 1)));
          return newList;
        });
        setDeletingId(null);
      }, ANIM_DURATION);
    }
  }, [setTodos, pageSize]);

  // Note: avoid calling setState inside an effect to prevent cascading renders.
  // We derive an effective page index at render time instead of forcing state here.

  // Enter edit mode for a specific task
  const startEditing = useCallback((todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  }, []);

  // Save changes and exit edit mode
  const saveEdit = useCallback((id) => {
    setTodos(prevTodos => prevTodos.map((t) => (t.id === id ? { ...t, text: editText } : t)));
    setEditingId(null);
  }, [editText, setTodos]);

  /* --- DRAG AND DROP LOGIC --- */

  const handleDragStart = useCallback((e, id) => {
    if (editingId) return;
    // Ensure dataTransfer is populated so browsers allow the drag to start
    try {
      if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', String(id));
        e.dataTransfer.effectAllowed = 'move';
      }
    } catch (err) {
      void err;
    }
    setTimeout(() => setDraggedItemId(id), 0);
  }, [editingId]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    try {
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    } catch (err) { void err; }
  }, []);

  const handleDragEnter = useCallback((id) => {
    if (draggedItemId === null || draggedItemId === id) return;

    setTodos(prevTodos => {
      const newList = [...prevTodos];
      const oldIdx = newList.findIndex((t) => t.id === draggedItemId);
      const newIdx = newList.findIndex((t) => t.id === id);

      const item = newList.splice(oldIdx, 1)[0];
      newList.splice(newIdx, 0, item);
      return newList;
    });
  }, [draggedItemId, setTodos]);

  // Pagination calculations (derived at render time)
  const totalPages = Math.max(1, Math.ceil(todos.length / pageSize));
  const maxPage = Math.max(0, totalPages - 1);
  const pageIndex = Math.min(currentPage, maxPage);
  const pageStart = pageIndex * pageSize;
  const visibleTodos = todos.slice(pageStart, pageStart + pageSize);
  const [pageSelectOpen, setPageSelectOpen] = useState(false);
  const [pageSelectClosing, setPageSelectClosing] = useState(false);
  const pageSelectRef = useRef(null);
  const pageDropdownRef = useRef(null);
  const [pageDropdownStyle, setPageDropdownStyle] = useState({ top: 0, left: 0, width: 0, maxHeight: 300 });
  
  // keep a ref in sync with `pageSelectOpen` so callbacks don't need that
  // boolean as a dependency (avoids stale closures and memoization warnings)
  const pageSelectOpenRef = useRef(pageSelectOpen);
  useEffect(() => { pageSelectOpenRef.current = pageSelectOpen; }, [pageSelectOpen]);

  const closePageSelect = useCallback(() => {
    if (!pageSelectOpenRef.current) return;
    setPageSelectClosing(true);
    const D = 220; // match CSS duration in index.css
    setTimeout(() => {
      setPageSelectOpen(false);
      setPageSelectClosing(false);
    }, D);
  }, [setPageSelectOpen, setPageSelectClosing]);

  // Close dropdown when clicking outside or on resize/scroll — use animated close
  useEffect(() => {
    function onDocClick(e) {
      if (!pageSelectRef.current) return;
      if (pageSelectRef.current.contains(e.target)) return;
      if (pageDropdownRef.current && pageDropdownRef.current.contains(e.target)) return;
      closePageSelect();
    }
    function onResize() { closePageSelect(); }
    document.addEventListener('click', onDocClick);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      document.removeEventListener('click', onDocClick);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [closePageSelect]);

  

  return (
    <div className="home-wrapper">
      {/* Background visual effects */}
      <div className="bg-animation">
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      {/* Main container shifts layout based on list length */}
      <div
        className={`mx-auto w-full max-w-[650px] flex flex-col items-center z-10 ${todos.length > 0 ? 'pt-10' : 'pt-[25vh]'} transition-[padding-top] duration-500`}
        style={{ minHeight: todos.length > 0 ? '80vh' : 'calc(100vh - 25vh)' }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-5xl font-bold mb-6 px-4 sm:px-0 text-white whitespace-nowrap overflow-hidden">
          {t('todo.title')}
        </h1>

        <div className="w-full flex items-end bg-[rgba(30,41,59,0.5)] backdrop-blur-md px-4 py-2 rounded-xl border border-[rgba(6,182,212,0.25)]">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder={t('todo.placeholder')}
            value={newText}
            onChange={(e) => { setNewText(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            onInput={autoResize}
            className="flex-1 min-w-0 bg-transparent text-white text-lg placeholder:text-slate-400 focus:outline-none resize-none transition-[height] duration-200 ease-out"
          />
          <button
            aria-label={t('todo.add')}
            onClick={addTodo}
            aria-hidden={newText.trim() === ''}
            disabled={newText.trim() === ''}
            className={`p-2 rounded-md hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/20 ml-2 text-sky-400 self-end transition-all duration-200 ease-out transform ${newText.trim() !== '' ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-1 scale-90 pointer-events-none'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <ul className="w-full mt-10" role="list">
          {visibleTodos.map((todo, index) => {
            const isFirst = index === 0;
            const isLast = index === visibleTodos.length - 1;
            const roundedClass = visibleTodos.length === 1 ? 'rounded-xl' : isFirst ? 'rounded-t-xl' : isLast ? 'rounded-b-xl' : '';

            return (
              <li
                ref={(el) => {
                  if (el) liRefs.current[todo.id] = el;
                  else delete liRefs.current[todo.id];
                }}
                key={todo.id}
                role="listitem"
                onDoubleClick={(e) => {
                  const now = e.timeStamp ?? getNow();
                  if (now - lastTouchAt.current < 700) return;
                  if (!editingId) toggleComplete(todo.id, now);
                }}
                onTouchStart={(e) => { if (!editingId) touchStart.current[todo.id] = e.timeStamp ?? getNow(); }}
                onTouchEnd={(e) => !editingId && handleTouchComplete(e, todo.id)}
                onTouchCancel={() => { if (touchStart.current) touchStart.current[todo.id] = 0; if (lastGlobalTap.current && lastGlobalTap.current.id === todo.id) lastGlobalTap.current = { id: null, time: 0 }; }}
                draggable={!editingId}
                onDragStart={(e) => handleDragStart(e, todo.id)}
                onDragEnter={() => handleDragEnter(todo.id)}
                onDragOver={handleDragOver}
                onDragEnd={() => setDraggedItemId(null)}
                className={`mb-4 transition-all duration-500 ease-in-out overflow-visible ${draggedItemId === todo.id ? 'opacity-30' : ''} ${deletingId === todo.id ? 'opacity-0 scale-95 max-h-0 mb-0 p-0' : ''}`}
                style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
              >
                <TodoItem
                  roundedClass={roundedClass}
                  todo={todo}
                  editingId={editingId}
                  editText={editText}
                  setEditText={setEditText}
                  startEditing={startEditing}
                  saveEdit={saveEdit}
                  setEditingId={setEditingId}
                  deleteTodo={deleteTodo}
                  toggleComplete={toggleComplete}
                  t={t}
                />
              </li>
            );
          })}
        </ul>

        {/* Modernize Edilmiş Fonksiyonel Pagination */}
        {todos.length > 0 && (
          <div className="w-full flex flex-row flex-wrap items-center md:justify-between justify-center gap-3 mt-10 mb-12 px-2 pt-6 border-t border-white/10">
            
            <div className="flex items-center gap-3">
              {/* Geri Butonu (ikon mobil için) */}
              <button
                className={`flex items-center justify-center p-1 rounded-md transition-colors ${pageIndex === 0 ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white'}`}
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={pageIndex === 0}
                aria-label={t('todo.previous')}
              >
                <ChevronLeft className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline text-sm">{t('todo.previous') || 'Previous'}</span>
              </button>

              {/* Sayı Grupları - compact on mobile */}
              <div className="flex items-center gap-1">
                {getPageRange(pageIndex, totalPages).map((p, i) => (
                  p === '...' ? (
                    <span key={`sep-${i}`} className="px-2 text-white/30 text-xs">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`
                        min-w-[28px] h-[28px] sm:min-w-[34px] sm:h-[34px] flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-all
                        ${p === currentPage 
                          ? 'border border-sky-400/50 text-sky-400 bg-sky-400/10 shadow-[0_0_15px_rgba(56,189,248,0.1)]' 
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                        }
                      `}
                      aria-current={p === currentPage}
                    >
                      {p + 1}
                    </button>
                  )
                ))}
              </div>

              {/* İleri Butonu (ikon mobil için) */}
              <button
                className={`flex items-center justify-center p-1 rounded-md transition-colors ${currentPage >= Math.ceil(todos.length / pageSize) - 1 ? 'text-white/20 cursor-not-allowed' : 'text-sky-400 hover:text-sky-300'}`}
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(todos.length / pageSize) - 1, p + 1))}
                disabled={currentPage >= Math.ceil(todos.length / pageSize) - 1}
                aria-label={t('todo.next')}
              >
                <span className="hidden sm:inline text-sm">{t('todo.next') || 'Next'}</span>
                <ChevronRight className="w-4 h-4 sm:hidden" />
              </button>
            </div>
            {/* Sağ Kısım: Sayfa Seçici (Sayfalar Arası Geçiş) */}
            {/* Custom page-select: button toggles a fixed-position dropdown that will position above if not enough space below */}
            <div className="relative group overflow-visible">
              <button
                ref={pageSelectRef}
                type="button"
                onClick={() => {
                  if (!pageSelectRef.current) return;
                  const rect = pageSelectRef.current.getBoundingClientRect();
                  const total = Math.max(1, Math.ceil(todos.length / pageSize));
                  const estimatedHeight = Math.min( (total * 40) + 16, window.innerHeight - 120 );
                  const spaceBelow = window.innerHeight - rect.bottom;
                  const placeAbove = spaceBelow < estimatedHeight && rect.top > spaceBelow;
                  const top = placeAbove ? Math.max(12, rect.top - estimatedHeight - 8) : rect.bottom + 8;
                  setPageDropdownStyle({ top, left: rect.left, width: rect.width, maxHeight: estimatedHeight });
                  if (!pageSelectOpen) {
                    setPageSelectClosing(false);
                    setPageSelectOpen(true);
                  } else {
                    // animate close
                    setPageSelectClosing(true);
                    setTimeout(() => { setPageSelectOpen(false); setPageSelectClosing(false); }, 180);
                  }
                }}
                className="appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-1 pr-8 text-sm text-white/70 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-sky-400/50 min-w-[44px] sm:w-auto text-center relative z-10 flex items-center justify-center gap-2 whitespace-nowrap"
                aria-haspopup="listbox"
                aria-expanded={pageSelectOpen}
              >
                <span className="whitespace-nowrap">{`${pageIndex + 1} / ${Math.max(1, Math.ceil(todos.length / pageSize))}`}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform ${pageSelectOpen ? 'rotate-180' : ''}`}>
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>

              {pageSelectOpen && typeof document !== 'undefined' && createPortal(
                <>
                  <div
                    className={`page-select-backdrop ${pageSelectClosing ? 'closing' : 'open'}`}
                    onClick={() => { closePageSelect(); }}
                  />

                  <div
                    ref={pageDropdownRef}
                    role="listbox"
                    className={`page-select-portal ${pageSelectClosing ? 'closing' : 'open'}`}
                    style={{ position: 'fixed', top: `${pageDropdownStyle.top}px`, left: `${pageDropdownStyle.left}px`, width: `${pageDropdownStyle.width}px`, maxHeight: `${pageDropdownStyle.maxHeight}px` }}
                  >
                    {Array.from({ length: Math.max(1, Math.ceil(todos.length / pageSize)) }).map((_, i) => (
                      <button
                        key={i}
                        role="option"
                        aria-selected={i === pageIndex}
                        onClick={() => { setCurrentPage(i); setPageSelectClosing(true); setTimeout(() => { setPageSelectOpen(false); setPageSelectClosing(false); }, 220); }}
                        className={`w-full text-left px-3 py-2 text-sm ${i === pageIndex ? 'bg-sky-400/10 text-sky-400 font-semibold' : 'text-white/80 hover:bg-white/5'}`}
                      >
                        {`${i + 1} / ${Math.max(1, Math.ceil(todos.length / pageSize))}`}
                      </button>
                    ))}
                  </div>
                </>, document.body
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TodoList;