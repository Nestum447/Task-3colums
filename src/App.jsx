import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// Firebase
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

/* ======================
   FIREBASE CONFIG
====================== */
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ======================
   COLUMNAS
====================== */
const columns = {
  todo: { title: "Todo", bg: "bg-blue-100/60", card: "bg-blue-50/90" },
  proceso: { title: "Proceso", bg: "bg-yellow-100/60", card: "bg-yellow-50/90" },
  delegadas: { title: "Delegadas", bg: "bg-green-100/60", card: "bg-green-50/90" },
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  /* ======================
     CARGAR DESDE FIREBASE
  ====================== */
  useEffect(() => {
    const q = query(
      collection(db, "tareas"),
      orderBy("status"),
      orderBy("order")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setTasks(data);
    });

    return () => unsub();
  }, []);

  /* ======================
     AGREGAR TAREA
  ====================== */
  const addTask = async () => {
    if (!newTask.trim()) return;

    const todoCount = tasks.filter((t) => t.status === "todo").length;

    await addDoc(collection(db, "tareas"), {
      title: newTask.trim(),
      status: "todo",
      order: todoCount,
      created: Date.now(),
    });

    // ✅ LIMPIA INPUT
    setNewTask("");
  };

  /* ======================
     DRAG & DROP
  ====================== */
  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const columnTasks = tasks.filter(
      (t) => t.status === source.droppableId
    );

    const movedTask = columnTasks[source.index];

    // Quitar de origen
    columnTasks.splice(source.index, 1);

    // Insertar en destino
    const destTasks =
      source.droppableId === destination.droppableId
        ? columnTasks
        : tasks.filter((t) => t.status === destination.droppableId);

    destTasks.splice(destination.index, 0, {
      ...movedTask,
      status: destination.droppableId,
    });

    const updates = [];

    destTasks.forEach((t, i) => {
      updates.push(
        updateDoc(doc(db, "tareas", t.id), {
          status: destination.droppableId,
          order: i,
        })
      );
    });

    if (source.droppableId !== destination.droppableId) {
      columnTasks.forEach((t, i) => {
        updates.push(updateDoc(doc(db, "tareas", t.id), { order: i }));
      });
    }

    await Promise.all(updates);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">
        Gestor de Tareas
      </h1>

      {/* AGREGAR */}
      <div className="flex justify-center gap-2 mb-6">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Nueva tarea..."
          className="border rounded px-3 py-2 w-64 bg-white"
        />
        <button
          onClick={addTask}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Agregar
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
                  className={`${col.bg} rounded-xl p-3 min-h-[350px]`}
                >
                  <h2 className="font-semibold text-center mb-3">
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
                            style={provided.draggableProps.style}
                            className={`${col.card} p-3 mb-2 rounded-lg shadow ${
                              snapshot.isDragging ? "opacity-90 scale-[1.02]" : ""
                            }`}
                          >
                            {task.title}
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
