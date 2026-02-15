import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody } from '@heroui/react';
import { Edit2, Trash, Check, X, GripVertical, CheckSquare, Square } from 'lucide-react';

export default function TodoItem({
  todo,
  editingId,
  editText,
  setEditText,
  startEditing,
  saveEdit,
  setEditingId,
  deleteTodo,
  t,
  roundedClass = '',
  toggleComplete
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = todo && todo.text && todo.text.length > 220;
  const editRef = useRef(null);
  const lastTapRef = useRef(0);

  const handleTextDoubleClick = (e) => {
    e.stopPropagation();
    if (toggleComplete) toggleComplete(todo.id, Date.now());
  };

  const handleTextTouchEnd = (e) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      e.preventDefault();
      e.stopPropagation();
      if (toggleComplete) toggleComplete(todo.id, Date.now());
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  useEffect(() => {
    if (editingId === todo.id && editRef.current) {
      // auto-resize when entering edit mode or when editText changes
      editRef.current.style.height = 'auto';
      editRef.current.style.height = `${editRef.current.scrollHeight}px`;
    }
  }, [editingId, editText, todo.id]);
  return (
    <Card
      className={`w-full ${roundedClass} bg-[color:var(--card-bg)] border border-[color:var(--card-border)] backdrop-blur-md overflow-visible transition-shadow duration-150 ease-out hover:shadow-lg hover:ring-1 hover:ring-sky-400`}
      style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      <CardBody className="px-3 py-3 overflow-visible">
        {editingId === todo.id ? (
          isLong ? (
            <div className="w-full flex flex-col gap-3">
              <textarea
                ref={editRef}
                className="w-full bg-[rgba(15,23,42,0.6)] border border-sky-400 rounded-md text-white px-3 py-2 outline-none resize-none min-h-[56px] whitespace-pre-wrap overflow-hidden"
                style={{ overflow: 'hidden' }}
                value={editText}
                onChange={(e) => { setEditText(e.target.value); if (editRef.current) { editRef.current.style.height = 'auto'; editRef.current.style.height = `${editRef.current.scrollHeight}px`; } }}
                onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) saveEdit(todo.id); }}
                autoFocus
              />
              <div className="flex items-center gap-2 justify-end">
                <button title={t('todo.done')} aria-label={t('todo.done')} onClick={() => saveEdit(todo.id)} className="p-2 rounded-md hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/20 bg-sky-400 text-slate-900">
                  <Check className="w-4 h-4" />
                </button>
                <button title={t('todo.cancel')} aria-label={t('todo.cancel')} onClick={() => setEditingId(null)} className="p-2 rounded-md hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/20 text-red-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full">
              <input
                className="flex-1 bg-[rgba(15,23,42,0.6)] border border-sky-400 rounded-md text-white px-3 py-2 outline-none"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button title={t('todo.done')} aria-label={t('todo.done')} onClick={() => saveEdit(todo.id)} className="p-2 rounded-md hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/20 bg-sky-400 text-slate-900">
                  <Check className="w-4 h-4" />
                </button>
                <button title={t('todo.cancel')} aria-label={t('todo.cancel')} onClick={() => setEditingId(null)} className="p-2 rounded-md hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/20 text-red-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex items-start">
              <button
                onClick={(e) => { e.stopPropagation(); if (toggleComplete) toggleComplete(todo.id, Date.now()); }}
                title={todo.completed ? t('todo.incomplete') : t('todo.complete')}
                aria-pressed={!!todo.completed}
                className={`p-2 mr-2 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors duration-150 ${todo.completed ? 'text-emerald-400 bg-emerald-900/10 hover:bg-emerald-900/20 focus-visible:ring-emerald-400' : 'text-sky-400 hover:bg-white/5'}`}
              >
                {todo.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex-1 min-w-0">
                    <div
                      className={`text-white font-medium break-words whitespace-normal ${todo.completed ? 'opacity-60 line-through text-slate-400' : ''}`}
                      style={
                        !expanded
                          ? { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }
                          : {}
                      }
                      onDoubleClick={handleTextDoubleClick}
                      onTouchEnd={handleTextTouchEnd}
                    >
                      {todo.text}
                    </div>
                    {isLong && (
                      <button onClick={() => setExpanded((s) => !s)} className="text-sm mt-1 text-sky-400 hover:underline">
                        {expanded ? t('todo.less') : t('todo.more')}
                      </button>
                    )}
                  </div>
            <div className="flex items-center gap-2">
              <button title={t('todo.edit')} aria-label={t('todo.edit')} onClick={() => startEditing(todo)} className="p-2 rounded-md hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/20 text-sky-400">
                <Edit2 className="w-4 h-4" />
              </button>
              <button title={t('todo.delete')} aria-label={t('todo.delete')} onClick={() => deleteTodo(todo.id)} className="p-2 rounded-md hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/20 text-red-400">
                <Trash className="w-4 h-4" />
              </button>
              <div className="text-white/40 ml-1">
                <GripVertical className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
