import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

/* =========================
   🔥 FIREBASE (SIN ANALYTICS)
   ========================= */
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD5iLXD-lyu6PZ0x0LrmK9khxWqrPPlPcA",
  authDomain: "gestor-tareas-36fc5.firebaseapp.com",
  projectId: "gestor-tareas-36fc5",
  storageBucket: "gestor-tareas-36fc5.firebasestorage.app",
  messagingSenderId: "326368524776",
  appId: "1:326368524776:web:531cea029c0afde8b28c5d",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {

  // ---------------------------
  //   ESTADO PRINCIPAL
  // ---------------------------
  const [tasks, setTasks] = useState({
    todo: [],
    proceso: [],
    delegadas: [],
  });

  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  // ---------------------------
  //   FIREBASE: CARGAR
  // ---------------------------
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
                { id: "3", text: "Tarea 3 en proceso", completed: false },
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

  // ---------------------------
  //   FIREBASE: GUARDAR
  // ---------------------------
  useEffect(() => {
    if (loading) return;
    setDoc(doc(db, "boards", "main"), { tasks });
  }, [tasks, loading]);

  // ---------------------------
  //   BORRAR TAREA
  // ---------------------------
  const deleteTask = (id) => {
    setTasks((prev) => {
      const newState = { ...prev };
      for (const col in newState) {
        newState[col] = newState[col].filter((t) => t.id !== id);
      }
      return newState;
    });
  };

  // ---------------------------
  //   MARCAR / DESMARCAR
  // ---------------------------
  const toggleComplete = (id) => {
    setTasks((prev) => {
      const newState = { ...prev };
      for (const col in newState) {
        newState[col] = newState[col].map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        );
      }
      return newState;
    });
  };

  // ---------------------------
  //   DRAG & DROP (ORIGINAL)
  // ---------------------------
  const handleDragEnd = (result) => {
    const sourceColumn = result.source.droppableId;

    if (!result.destination) {
      setTasks((prev) => ({
        ...prev,
        [sourceColumn]: prev[sourceColumn].filter(
          (t, index) => index !== result.source.index
        ),
      }));
      return;
    }

    const destColumn = result.destination.droppableId;

    if (sourceColumn === destColumn) {
      const columnTasks = Array.from(tasks[sourceColumn]);
      const [movedTask] = columnTasks.splice(result.source.index, 1);
      columnTasks.splice(result.destination.index, 0, movedTask);

      setTasks({
        ...tasks,
        [sourceColumn]: columnTasks,
      });
      return;
    }

    const sourceTasks = Array.from(tasks[sourceColumn]);
    const destTasks = Array.from(tasks[destColumn]);

    const [movedTask] = sourceTasks.splice(result.source.index, 1);
    destTasks.splice(result.destination.index, 0, movedTask);

    setTasks({
      ...tasks,
      [sourceColumn]: sourceTasks,
      [destColumn]: destTasks,
    });
  };

  // ---------------------------
  //   AGREGAR TAREA
  // ---------------------------
  const addTask = () => {
    if (!newTask.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
    };

    setTasks({
      ...tasks,
      todo: [...tasks.todo, newItem],
    });

    setNewTask("");
  };

  // ---------------------------
  //   LOADING
  // ---------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Cargando datos...
      </div>
    );
  }

  // ---------------------------
  //   UI (SIN CAMBIOS)
  // ---------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Gestor de Tareas</h1>

      <div className="flex justify-center mb-6 gap-2">
        <input
          type="text"
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

          {["todo", "proceso", "delegadas"].map((col, idx) => (
            <Droppable droppableId={col} key={idx}>
              {(provided) => (
                <div
                  className="bg-white p-4 rounded shadow min-h-[300px]"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
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
                          className="flex items-center justify-between p-3 bg-gray-100 rounded mb-2 shadow"
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleComplete(task.id)}
                          />
                          <span
                            className={
                              task.completed
                                ? "line-through text-gray-600"
                                : ""
                            }
                          >
                            {task.text}
                          </span>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-red-600 text-xl"
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
