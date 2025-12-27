import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

/* =========================
   🔥 FIREBASE CONFIG (TUYO)
   ========================= */
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD5iLXD-lyu6PZ0x0LrmK9khxWqrPPlPcA",
  authDomain: "gestor-tareas-36fc5.firebaseapp.com",
  projectId: "gestor-tareas-36fc5",
  storageBucket: "gestor-tareas-36fc5.firebasestorage.app",
  messagingSenderId: "326368524776",
  appId: "1:326368524776:web:531cea029c0afde8b28c5d",
  measurementId: "G-667RSDXM8Q",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app); // opcional
const db = getFirestore(app);

/* =========================
   🚀 APP
   ========================= */
export default function App() {
  const [tasks, setTasks] = useState({
    todo: [],
    proceso: [],
    delegadas: [],
  });

  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  /* ---------------------------
     CARGAR DESDE FIRESTORE
     --------------------------- */
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const ref = doc(db, "boards", "main");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setTasks(snap.data().tasks);
        } else {
          const initialData = {
            tasks: {
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
            },
          };
          await setDoc(ref, initialData);
          setTasks(initialData.tasks);
        }
      } catch (error) {
        console.error("Error cargando Firebase", error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  /* ---------------------------
     GUARDAR EN FIRESTORE
     --------------------------- */
  useEffect(() => {
    if (loading) return;

    const saveTasks = async () => {
      try {
        await setDoc(doc(db, "boards", "main"), { tasks });
      } catch (error) {
        console.error("Error guardando Firebase", error);
      }
    };

    saveTasks();
  }, [tasks, loading]);

  /* ---------------------------
     ACCIONES
     --------------------------- */
  const addTask = () => {
    if (!newTask.trim()) return;

    setTasks({
      ...tasks,
      todo: [
        ...tasks.todo,
        {
          id: Date.now().toString(),
          text: newTask,
          completed: false,
        },
      ],
    });

    setNewTask("");
  };

  const deleteTask = (id) => {
    setTasks((prev) => {
      const updated = { ...prev };
      for (const col in updated) {
        updated[col] = updated[col].filter((t) => t.id !== id);
      }
      return updated;
    });
  };

  const toggleComplete = (id) => {
    setTasks((prev) => {
      const updated = { ...prev };
      for (const col in updated) {
        updated[col] = updated[col].map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        );
      }
      return updated;
    });
  };

  /* ---------------------------
     DRAG & DROP
     --------------------------- */
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const source = result.source.droppableId;
    const dest = result.destination.droppableId;

    if (source === dest) {
      const items = Array.from(tasks[source]);
      const [moved] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, moved);
      setTasks({ ...tasks, [source]: items });
      return;
    }

    const sourceItems = Array.from(tasks[source]);
    const destItems = Array.from(tasks[dest]);

    const [moved] = sourceItems.splice(result.source.index, 1);
    destItems.splice(result.destination.index, 0, moved);

    setTasks({
      ...tasks,
      [source]: sourceItems,
      [dest]: destItems,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Cargando datos...
      </div>
    );
  }

  /* ---------------------------
     UI
     --------------------------- */
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Gestor de Tareas (Firebase)
      </h1>

      <div className="flex justify-center mb-6 gap-2">
        <input
          className="border border-gray-400 rounded p-2 w-64"
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
          {["todo", "proceso", "delegadas"].map((col) => (
            <Droppable key={col} droppableId={col}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-white p-4 rounded shadow min-h-[300px]"
                >
                  <h2 className="text-xl font-semibold mb-3 capitalize">
                    {col}
                  </h2>

                  {tasks[col].map((task, index) => (
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
                          className="flex items-center justify-between p-3 bg-gray-100 rounded mb-2"
                        >
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
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-red-600"
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
