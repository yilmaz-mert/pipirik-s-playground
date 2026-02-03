import { useState, useEffect } from "react";
import "./TodoList.css";
import "../../../App.css";

function TodoList() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("pipirik-todos");
    return saved ? JSON.parse(saved) : [];
  });

  const [draggedItemId, setDraggedItemId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    localStorage.setItem("pipirik-todos", JSON.stringify(todos));
  }, [todos]);

  const handleKeyDown = (event) => {
    const val = event.target.value;
    if (event.key === "Enter" && val.trim() !== "") {
      const newTodo = { 
        id: Date.now(), 
        text: val.trim(), 
        completed: false // Yeni görevler tamamlanmamış olarak başlar
      };
      setTodos([...todos, newTodo]);
      event.target.value = "";
    }
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to delete all tasks, Pipirik?")) {
      setTodos([]);
    }
  };

  const deleteTodo = (id) => {
    setDeletingId(id);
    setTimeout(() => {
      setTodos(todos.filter((t) => t.id !== id));
      setDeletingId(null);
    }, 400); 
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, text: editText } : t)));
    setEditingId(null);
  };

  const handleDragStart = (e, id) => {
    if (editingId) return;
    setTimeout(() => setDraggedItemId(id), 0);
  };

  const handleDragEnter = (id) => {
    if (draggedItemId === null || draggedItemId === id) return;
    const newList = [...todos];
    const oldIdx = newList.findIndex((t) => t.id === draggedItemId);
    const newIdx = newList.findIndex((t) => t.id === id);
    const item = newList.splice(oldIdx, 1)[0];
    newList.splice(newIdx, 0, item);
    setTodos(newList);
  };

  return (
    <div className="home-wrapper">
      {/* Background Blobs */}
      <div className="bg-animation">
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

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