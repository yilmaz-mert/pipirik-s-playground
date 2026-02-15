import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from 'react-i18next';
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
        setTodos(prev => [...prev, newTodo]);
      }
      event.preventDefault();
      setNewText('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  }, [setTodos]);

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
    setTodos(prev => [...prev, newTodo]);
    setNewText('');
    if (ta) ta.style.height = 'auto';
  }, [setTodos]);

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
        setTodos(prevTodos => prevTodos.filter((t) => t.id !== id));
        // cleanup
        delete liRefs.current[id];
      }, ANIM_DURATION);
    } else {
      // fallback
      setDeletingId(id);
      setTimeout(() => {
        setTodos(prevTodos => prevTodos.filter((t) => t.id !== id));
        setDeletingId(null);
      }, ANIM_DURATION);
    }
  }, [setTodos]);

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

  return (
    <div className="home-wrapper">
      {/* Background visual effects */}
      <div className="bg-animation">
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      {/* Main container shifts layout based on list length */}
      <div
        className={`mx-auto w-full max-w-[650px] flex flex-col items-center z-10 ${todos.length > 0 ? 'pt-12' : 'pt-[25vh]'} transition-[padding-top] duration-500`}
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
          {todos.map((todo, index) => (
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
              {(() => {
                const isFirst = index === 0;
                const isLast = index === todos.length - 1;
                const roundedClass = todos.length === 1 ? 'rounded-xl' : isFirst ? 'rounded-t-xl' : isLast ? 'rounded-b-xl' : '';
                return (
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
                );
              })()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TodoList;