import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// 🔥 Firebase
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

// 👉 CONFIGURA CON TUS DATOS
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Columnas Trello
const columns = {
  todo: {
    title: "Todo",
    bg: "bg-blue-100/60",
    card: "bg-blue-50/80",
  },
  proceso: {
    title: "Proceso",
    bg: "bg-yellow-100/60",
    card: "bg-yellow-50/80",
  },
  delegadas: {
    title: "Delegadas",
    bg: "bg-green-100/60",
    card: "bg-green-50/80",
  },
};

export default function App() {
  const [tasks, setTasks] = useState([]);

  // 🔄 Escuchar Firebase
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "tareas"), (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setTasks(data);
    });
    return () => unsub();
  }, []);

  // ➕ Nueva tarea
  const addTask = async () => {
    const title = prompt("Nueva tarea");
    if (!title) return;

    await addDoc(collection(db, "tareas"), {
      title,
      status: "todo",
      created: Date.now(),
    });
  };

  // 🔁 Drag terminado
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;

    const taskRef = doc(db, "tareas", draggableId);
    await updateDoc(taskRef, {
      status: destination.droppableId,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 overscroll-none touch-none">
      <h1 className="text-2xl font-bold text-center mb-4">
        Tablero de Tareas
      </h1>

      <div className="text-center mb-4">
        <button
          onClick={addTask}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
        >
          + Nueva tarea
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(columns).map(([key, col]) => (
            <Droppable droppableId={key} key={key}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`${col.bg} rounded-xl p-3 min-h-[400px]`}
                >
                  <h2 className="font-semibold mb-3 text-center">
                    {col.title}
                  </h2>

                  {tasks
                    .filter((t) => t.status === key)
                    .map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                            }}
                            className={`
                              ${col.card}
                              p-3 mb-2 rounded-lg
                              flex justify-between items-center
                              transition
                              touch-none select-none
                              ${
                                snapshot.isDragging
                                  ? "shadow-xl scale-[1.02] opacity-90"
                                  : "shadow-sm"
                              }
                            `}
                          >
                            <span>{task.title}</span>
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
