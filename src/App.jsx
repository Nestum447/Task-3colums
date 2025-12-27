import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

export default function App() {
  const [tasks, setTasks] = useState({
    todo: [],
    proceso: [],
    delegadas: [],
  });

  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState("");

  /* =====================
     🔥 CARGAR FIREBASE
     ===================== */
  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "boards", "main");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setTasks(snap.data().tasks);
      } else {
        const initial = {
          tasks: {
            todo: [],
            proceso: [],
            delegadas: [],
          },
        };
        await setDoc(ref, initial);
        setTasks(initial.tasks);
      }
      setLoading(false);
    };
    load();
  }, []);

  /* =====================
     🔥 GUARDAR FIREBASE
     ===================== */
  useEffect(() => {
    if (!loading) {
      setDoc(doc(db, "boards", "main"), { tasks });
    }
  }, [tasks, loading]);

  /* =====================
     ➕ AGREGAR TAREA
     ===================== */
  const addTask = () => {
    if (!newTask.trim()) return;

    setTasks(prev => ({
      ...prev,
      todo: [
        ...prev.todo,
        {
          id: Date.now().toString(),
          text: newTask,
          completed: false,
        },
      ],
    }));
    setNewTask("");
  };

  /* =====================
     ✏️ EDITAR
     ===================== */
  const saveEdit = (col, id) => {
    setTasks(prev => ({
      ...prev,
      [col]: prev[col].map(t =>
        t.id === id ? { ...t, text: editText } : t
      ),
    }));
    setEditingTask(null);
  };

  /* =====================
     🗑️ ELIMINAR
     ===================== */
  const deleteTask = id => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    setTasks(prev => {
      const copy = { ...prev };
      Object.keys(copy).forEach(
        c => (copy[c] = copy[c].filter(t => t.id !== id))
      );
      return copy;
    });
  };

  /* =====================
     ✔️ COMPLETAR
     ===================== */
  const toggleComplete = id => {
    setTasks(prev => {
      const copy = { ...prev };
      Object.keys(copy).forEach(col => {
        copy[col] = copy[col].map(t =>
          t.id === id ? { ...t, completed: !t.completed } : t
        );
      });
      return copy;
    });
  };

  /* =====================
     🧲 DRAG CONTROLADO
     ===================== */
  const handleDragEnd = result => {
    if (!result.destination) return;

    const src = result.source.droppableId;
    const dst = result.destination.droppableId;

    const srcItems = Array.from(tasks[src]);
    const [moved] = srcItems.splice(result.source.index, 1);

    const dstItems =
      src === dst ? srcItems : Array.from(tasks[dst]);

    dstItems.splice(result.destination.index, 0, moved);

    setTasks({
      ...tasks,
      [src]: src === dst ? dstItems : srcItems,
      [dst]: dstItems,
    });

    setSelectedTaskId(null);
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-xl">
        Cargando datos...
      </div>
    );
  }

  const colors = {
    todo: "bg-blue-100/60",
    proceso: "bg-yellow-100/60",
    delegadas: "bg-green-100/60",
  };

  return (
    <div className="p-4 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-4">
        Gestor de Tareas
      </h1>

      {/* NUEVA TAREA */}
      <div className="flex justify-center gap-2 mb-6">
        <input
          className="border rounded px-3 py-2 w-64"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Nueva tarea..."
        />
        <button
          onClick={addTask}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Agregar
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid md:grid-cols-3 gap-4">
          {["todo", "proceso", "delegadas"].map(col => (
            <Droppable droppableId={col} key={col}>
              {p => (
                <div
                  ref={p.innerRef}
                  {...p.droppableProps}
                  className={`${colors[col]} rounded p-3 min-h-[300px]`}
                >
                  <h2 className="font-semibold text-lg mb-3 capitalize">
                    {col}
                  </h2>

                  {tasks[col].map((task, i) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={i}
                      isDragDisabled={selectedTaskId !== task.id}
                    >
                      {d => (
                        <div
                          ref={d.innerRef}
                          {...d.draggableProps}
                          {...d.dragHandleProps}
                          onClick={() =>
                            setSelectedTaskId(task.id)
                          }
                          className={`bg-white rounded p-3 mb-2 shadow flex justify-between items-center
                          cursor-pointer
                          ${
                            selectedTaskId === task.id
                              ? "ring-2 ring-blue-500"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() =>
                                toggleComplete(task.id)
                              }
                            />
                            {editingTask === task.id ? (
                              <input
                                className="border rounded px-2"
                                value={editText}
                                onChange={e =>
                                  setEditText(e.target.value)
                                }
                                onBlur={() =>
                                  saveEdit(col, task.id)
                                }
                                autoFocus
                              />
                            ) : (
                              <span
                                className={
                                  task.completed
                                    ? "line-through text-gray-500"
                                    : ""
                                }
                              >
                                {task.text}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-3 text-xl">
                            ✏️
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setEditingTask(task.id);
                                setEditText(task.text);
                              }}
                            />
                            🗑️
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                deleteTask(task.id);
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {p.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
