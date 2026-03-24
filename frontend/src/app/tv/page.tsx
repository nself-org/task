'use client';

import { useEffect, useRef, useState } from 'react';
import { useTVNavigation } from '@/lib/tv/navigation';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  listName?: string;
}

export default function TVPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { handleKeyDown } = useTVNavigation(tasks.length, focusedIndex, setFocusedIndex);

  // Clock update
  useEffect(() => {
    const updateClock = () => {
      const el = document.getElementById('tv-clock');
      if (el) el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    updateClock();
    const id = setInterval(updateClock, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => handleKeyDown(e as unknown as React.KeyboardEvent);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKeyDown]);

  return (
    <div className="px-12 py-8">
      <h1 className="text-4xl font-bold mb-8">My Tasks</h1>

      {tasks.length === 0 ? (
        <TVEmptyState />
      ) : (
        <TVTaskList tasks={tasks} focusedIndex={focusedIndex} />
      )}
    </div>
  );
}

function TVEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
      <div className="text-8xl text-indigo-400 opacity-30">✓</div>
      <p className="text-2xl text-white/50">No tasks yet</p>
      <p className="text-lg text-white/30">Open ɳTask on your phone to add tasks</p>
    </div>
  );
}

function TVTaskList({ tasks, focusedIndex }: { tasks: Task[]; focusedIndex: number }) {
  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <TVTaskRow
          key={task.id}
          task={task}
          focused={index === focusedIndex}
        />
      ))}
    </div>
  );
}

function TVTaskRow({ task, focused }: { task: Task; focused: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focused]);

  return (
    <div
      ref={ref}
      className={`flex items-center gap-6 px-8 py-6 rounded-2xl transition-all duration-150 ${
        focused
          ? 'bg-indigo-600 scale-[1.02] shadow-lg shadow-indigo-900/50'
          : 'bg-white/5 hover:bg-white/10'
      }`}
      tabIndex={focused ? 0 : -1}
    >
      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
        task.completed ? 'bg-green-500 border-green-500' : 'border-white/40'
      }`}>
        {task.completed && <span className="text-white text-sm">✓</span>}
      </div>
      <div className="flex-1">
        <p className={`text-xl ${task.completed ? 'line-through text-white/40' : 'text-white'}`}>
          {task.title}
        </p>
        {task.listName && (
          <p className="text-sm text-white/50 mt-1">{task.listName}</p>
        )}
      </div>
    </div>
  );
}
