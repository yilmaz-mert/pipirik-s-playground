import { useState, useEffect, useRef, useCallback } from "react";
import "./TodoList.css";
import "../../../App.css";
import 'drag-drop-touch';

const getNow = () => Date.now();

function TodoList() {
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
  
  // Refs to track taps and touch duration per-item on mobile devices
  const touchStart = useRef({});
  const lastToggle = useRef({});
  const lastGlobalTap = useRef({ id: null, time: 0 });
  const lastTouchAt = useRef(0);

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
    const val = event.target.value;
    if (event.key === "Enter" && val.trim() !== "") {
      const newTodo = { id: getNow(), text: val.trim(), completed: false };
      setTodos(prev => [...prev, newTodo]);
      event.target.value = "";
    }
  }, [setTodos]);

  // clearAll functionality removed

  // Trigger delete animation and then remove the item
  const deleteTodo = useCallback((id) => {
    setDeletingId(id);
    setTimeout(() => {
      setTodos(prevTodos => prevTodos.filter((t) => t.id !== id));
      setDeletingId(null);
    }, 400);
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
    setTimeout(() => setDraggedItemId(id), 0);
  }, [editingId]);

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
      <div className={`todo-container ${todos.length > 0 ? "at-top" : "centered"}`}>
        <h1 className="hero-title">Pipirik's <span>Tasks</span></h1>
        
        <div className="todo-input-wrapper">
          <input 
            type="text" 
            placeholder="Type your task and press Enter..." 
            onKeyDown={handleKeyDown} 
            className="main-input"
          />
        </div>

        <ul className="todo-list">
          {todos.map((todo) => (
            <li 
              key={todo.id} 
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
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={() => setDraggedItemId(null)}
              className={`
                  ${draggedItemId === todo.id ? "dragging" : ""} 
                  ${deletingId === todo.id ? "deleting" : ""}
                  ${todo.completed ? "completed" : ""}
                `}
            >
              {editingId === todo.id ? (
                /* Rendering the Edit UI */
                <div className="edit-container">
                  <input 
                    className="edit-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(todo.id)}
                    autoFocus 
                  />
                  <div className="item-actions">
                    <button className="save-btn" onClick={() => saveEdit(todo.id)}>Done</button>
                    <button className="cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                /* Rendering the Standard UI */
                <>
                  <span className="todo-text">{todo.text}</span>
                  <div className="item-actions">
                    <button className="edit-btn" onClick={() => startEditing(todo)}>Edit</button>
                    <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TodoList;