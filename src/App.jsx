import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function App() {

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
      } catch (err) {
        console.error("🔥 Error cargando Firebase:", err);
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

    const save = async () => {
      try {
        await setDoc(doc(db, "boards", "main"), { tasks });
      } catch (err) {
        console.error("🔥 Error guardando Firebase:", err);
      }
    };

    save();
  }, [tasks, loading]);

  /* =========================
     🗑️ BORRAR
     ========================= */
  const deleteTask = (id) => {
    setTasks((prev) => {
      const copy = { ...prev };
      for (const col in copy) {
        copy[col] = copy[col].filter((t) => t.id !== id);
      }
      return copy;
    });
  };

  /* =========================
     ✅ COMPLETAR
     ========================= */
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
     🧲 DRAG & DROP
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
     ➕ AGREGAR
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Cargando datos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Gestor de Tareas
      </h1>

      <div className="flex justify-center mb-6 gap-2">
        <input
          className="border p-2 w-64"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Nueva tarea..."
        />
        <button onClick={addTask} className="bg-blue-600 text-white px-4">
          Agregar
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["todo", "proceso", "delegadas"].map((col) => (
            <Droppable droppableId={col} key={col}>
              {(p) => (
                <div ref={p.innerRef} {...p.droppableProps}
                  className="bg-white p-4 rounded shadow min-h-[300px]"
                >
                  <h2 className="font-bold capitalize mb-3">{col}</h2>

                  {tasks[col].map((task, i) => (
                    <Draggable key={task.id} draggableId={task.id} index={i}>
                      {(p) => (
                        <div ref={p.innerRef} {...p.draggableProps}
                          {...p.dragHandleProps}
                          className="p-3 bg-gray-100 rounded mb-2 flex justify-between"
                        >
                          <span>{task.text}</span>
                          <button onClick={() => deleteTask(task.id)}>🗑️</button>
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
