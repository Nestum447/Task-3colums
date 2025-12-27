import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { db } from "./firebase";

const columns = [
  { id: "todo", title: "To Do", color: "bg-blue-200/60" },
  { id: "proceso", title: "Proceso", color: "bg-yellow-200/60" },
  { id: "delegadas", title: "Delegadas", color: "bg-green-200/60" },
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  /* =========================
     🔥 CARGAR DESDE FIREBASE
     ========================= */
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

  /* =========================
     ➕ AGREGAR TAREA
     ========================= */
  const addTask = async () => {
    if (!newTask.trim()) return;

    const order = tasks.filter((t) => t.status === "todo").length;

    await addDoc(collection(db, "tareas"), {
      title: newTask.trim(),
      status: "todo",
      order,
      completed: false,
      created: Date.now(),
    });

    // ✅ LIMPIA INPUT
    setNewTask("");
  };

  /* =========================
     🔀 DRAG & DROP (ROBUSTO)
     ========================= */
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    const sourceTasks = tasks
      .filter((t) => t.status === sourceCol)
      .sort((a, b) => a.order - b.order);

    const destTasks =
      sourceCol === destCol
        ? sourceTasks
        : tasks
            .filter((t) => t.status === destCol)
            .sort((a, b) => a.order - b.order);

    const moved = sourceTasks[source.index];
    sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, moved);

    const updates = [];

    sourceTasks.forEach((t, i) =>
      updates.push(updateDoc(doc(db, "tareas", t.id), { order: i }))
    );

    destTasks.forEach((t, i) =>
      updates.push(
        updateDoc(doc(db, "tareas", t.id), {
          order: i,
          status: destCol,
        })
      )
    );

    await Promise.all(updates);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">
        Gestor de Tareas
      </h1>

      {/* ➕ NUEVA TAREA */}
      <div className="flex justify-center gap-2 mb-6">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Nueva tarea..."
          className="border rounded p-2 w-64"
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
          {columns.map((col) => {
            const colTasks = tasks
              .filter((t) => t.status === col.id)
              .sort((a, b) => a.order - b.order);

            return (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 rounded shadow min-h-[300px] ${col.color}`}
                  >
                    <h2 className="text-xl font-semibold mb-3">
                      {col.title}
                    </h2>

                    {colTasks.map((task, index) => (
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
                            className="bg-white/80 backdrop-blur p-3 rounded mb-2 shadow cursor-grab active:cursor-grabbing"
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
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
