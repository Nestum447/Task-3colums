import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function App() {
  /* =========================
     ESTADOS
     ========================= */
  const [tasks, setTasks] = useState({
    todo: [],
    proceso: [],
    delegadas: [],
  });

  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================
     🔥 CARGAR DESDE FIREBASE
     ========================= */
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const ref = doc(db, "boards", "main");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setTasks(snap.data().tasks);
        } else {
          const initialTasks = {
            todo: [
              { id: "1", text: "Tarea 1", completed: false },
              { id: "2", text: "Tarea 2", completed: false },
            ],
            proceso: [
              { id: "3", text: "Tarea en proceso", completed: false },
            ],
            delegadas: [
              { id: "4", text: "Tarea delegada", completed: false },
            ],
          };

          await setDoc(ref, { tasks: initialTasks });
          setTasks(initialTasks);
        }
      } catch (error) {
        console.error("Error cargando Firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  /* =========================
     💾 GUARDAR EN FIREBASE
     ========================= */
  useEffect(() => {
    if (loading) return;

    const saveTasks = async () => {
      try {
        await setDoc(doc(db, "boards", "main"), { tasks });
      } catch (error) {
        console.error("Error guardando Firebase:", error);
      }
    };

    saveTasks();
  }, [tasks, loading]);

  /* =========================
     ACCIONES
     ========================= */
  const addTask = () => {
    if (!newTask.trim()) return;

    setTasks({
      ...tasks,
      todo: [
        ...tasks.todo,
        { id: Date.now().toString(), text: newTask, completed: false },
      ],
    });

    setNewTask("");
  };

  const deleteTask = (id) => {
    setTasks((prev) => {
      const copy = { ...prev };
      for (const col in copy) {
        copy[col] = copy[col].filter((t) => t.id !== id);
      }
      return copy;
    });
  };

  const toggleComplete = (id) => {
    setTasks((prev) => {
      const copy = { ...prev };
      for (const col in copy) {
        copy[col] = copy[col].map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        );
      }
      return copy;
    });
  };

  /* =========================
     DRAG & DROP
     ========================= */
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const src = result.source.droppableId;
    const dst = result.destination.droppableId;

    if (src === dst) {
      const items = Array.from(tasks[src]);
      const [moved] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, moved);
      setTasks({ ...tasks, [src]: items });
      return;
    }

    const srcItems = Array.from(tasks[src]);
    const dstItems = Array.from(tasks[dst]);

    const [moved] = srcItems.splice(result.source.index, 1);
    dstItems.splice(result.destination.index, 0, moved);

    setTasks({
      ...tasks,
      [src]: srcItems,
      [dst]: dstItems,
    });
  };

  /* =========================
     LOADING
     ========================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Cargando datos...
      </div>
    );
  }

  /* =========================
     UI
     ========================= */
  const columns = [
    {
      id: "todo",
      title: "To Do",
      bg: "bg-blue-100/60",
      card: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      id: "proceso",
      title: "En Proceso",
      bg: "bg-yellow-100/60",
      card: "bg-yellow-50",
      text: "text-yellow-700",
    },
    {
      id: "delegadas",
      title: "Delegadas",
      bg: "bg-green-100/60",
      card: "bg-green-50",
      text: "text-green-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Gestor de Tareas
      </h1>

      {/* Nueva tarea */}
      <div className="flex justify-center mb-6 gap-2">
        <input
          className="border border-gray-300 rounded p-2 w-64"
          placeholder="Nueva tarea..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button
          onClick={addTask}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Agregar
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`${col.bg} p-4 rounded-xl shadow-sm min-h-[300px] backdrop-blur`}
                >
                  <h2 className={`font-bold mb-3 ${col.text}`}>
                    {col.title}
                  </h2>

                  {tasks[col.id].map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 ${col.card} rounded-lg mb-2 shadow-sm hover:shadow transition flex items-center justify-between`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleComplete(task.id)}
                            />
                            <span
                              className={
                                task.completed
                                  ? "line-through text-gray-500"
                                  : ""
                              }
                            >
                              {task.text}
                            </span>
                          </div>

                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-red-600 text-lg"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
