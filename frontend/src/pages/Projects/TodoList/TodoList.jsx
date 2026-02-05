import { useState, useEffect, useRef, useCallback } from "react";
import "./TodoList.css";
import "../../../App.css";
import 'drag-drop-touch'; // Polyfill for mobile drag and drop support

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
  
  // Ref to track double-tap timing on mobile devices
  const lastTap = useRef(0);

  /* --- EFFECTS --- */

  // Sync todos to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem("pipirik-todos", JSON.stringify(todos));
  }, [todos]);

  /* --- HANDLERS (LOGIC) --- */

  // Toggle the completion status of a task
  const toggleComplete = (id) => {
    setTodos(prevTodos => 
      prevTodos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  };

  // Special double-tap handler for mobile users to toggle completion
  const handleTouchComplete = useCallback((id) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300; // milliseconds
    
    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      toggleComplete(id);
    }
    lastTap.current = now;
  }, []);

  // Add new task on Enter key press
  const handleKeyDown = (event) => {
    const val = event.target.value;
    if (event.key === "Enter" && val.trim() !== "") {
      const newTodo = { 
        id: Date.now(), 
        text: val.trim(), 
        completed: false 
      };
      setTodos([...todos, newTodo]);
      event.target.value = "";
    }
  };

  // Remove all tasks after confirmation
  const clearAll = () => {
    if (window.confirm("Are you sure you want to delete all tasks, Pipirik?")) {
      setTodos([]);
    }
  };

  // Trigger delete animation and then remove the item
  const deleteTodo = (id) => {
    setDeletingId(id);
    setTimeout(() => {
      setTodos(prevTodos => prevTodos.filter((t) => t.id !== id));
      setDeletingId(null);
    }, 400);
  };

  // Enter edit mode for a specific task
  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  // Save changes and exit edit mode
  const saveEdit = (id) => {
    setTodos(prevTodos => prevTodos.map((t) => (t.id === id ? { ...t, text: editText } : t)));
    setEditingId(null);
  };

  /* --- DRAG AND DROP LOGIC --- */

  const handleDragStart = (e, id) => {
    if (editingId) return; // Prevent dragging while editing
    setTimeout(() => setDraggedItemId(id), 0);
  };

  const handleDragEnter = (id) => {
    if (draggedItemId === null || draggedItemId === id) return;
    
    setTodos(prevTodos => {
      const newList = [...prevTodos];
      const oldIdx = newList.findIndex((t) => t.id === draggedItemId);
      const newIdx = newList.findIndex((t) => t.id === id);
      
      const item = newList.splice(oldIdx, 1)[0];
      newList.splice(newIdx, 0, item);
      return newList;
    });
  };

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
          <button className="clear-all-btn" onClick={clearAll} title="Clear All">✕</button>
        </div>

        <ul className="todo-list">
          {todos.map((todo) => (
            <li 
              key={todo.id} 
              onDoubleClick={() => !editingId && toggleComplete(todo.id)}
              onTouchStart={() => !editingId && handleTouchComplete(todo.id)}
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