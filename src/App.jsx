import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
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

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingAssignee, setEditingAssignee] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");

  /* 🔔 Permiso notificaciones */
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  /* 🔥 Firebase realtime */
  useEffect(() => {
    return onSnapshot(collection(db, "tareas"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTasks(data);
    });
  }, []);

  /* ➕ Agregar */
  const addTask = async () => {
    if (!newTask.trim()) return;

    const order = tasks.filter((t) => t.status === "todo").length;

    await addDoc(collection(db, "tareas"), {
      title: newTask.trim(),
      assignee: "",
      dueDate: "",
      status: "todo",
      order,
      created: Date.now(),
    });

    setNewTask("");
  };

  /* ✏️ Guardar edición */
  const saveEdit = async (task) => {
    await updateDoc(doc(db, "tareas", task.id), {
      title: editingText.trim(),
      assignee: editingAssignee.trim(),
      dueDate: editingDueDate,
    });

    setEditingId(null);
    setEditingText("");
    setEditingAssignee("");
    setEditingDueDate("");
  };

  /* 🗑️ Eliminar */
  const removeTask = async (task) => {
    if (!window.confirm(`¿Eliminar "${task.title}"?`)) return;
    await deleteDoc(doc(db, "tareas", task.id));
  };

  /* 🔀 Drag */
  const handleDragEnd = async ({ source, destination }) => {
    if (!destination) return;

    const src = source.droppableId;
    const dst = destination.droppableId;

    const srcTasks = tasks
      .filter((t) => t.status === src)
      .sort((a, b) => a.order - b.order);

    const dstTasks =
      src === dst
        ? srcTasks
        : tasks
            .filter((t) => t.status === dst)
            .sort((a, b) => a.order - b.order);

    const [moved] = srcTasks.splice(source.index, 1);
    dstTasks.splice(destination.index, 0, moved);

    await Promise.all([
      ...srcTasks.map((t, i) =>
        updateDoc(doc(db, "tareas", t.id), { order: i })
      ),
      ...dstTasks.map((t, i) =>
        updateDoc(doc(db, "tareas", t.id), {
          order: i,
          status: dst,
        })
      ),
    ]);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">
        Gestor de Tareas
      </h1>

      {/* Nueva tarea */}
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
              <Droppable key={col.id} droppableId={col.id}>
                {(p) => (
                  <div
                    ref={p.innerRef}
                    {...p.droppableProps}
                    className={`p-4 rounded shadow min-h-[300px] ${col.color}`}
                  >
                    <h2 className="text-xl font-semibold mb-3">
                      {col.title}
                    </h2>

                    {colTasks.map((task, index) => {
                      const overdue =
                        task.dueDate && task.dueDate < today;

                      return (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(p) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                              className={`bg-white/80 p-3 rounded mb-2 shadow border-l-4 ${
                                overdue
                                  ? "border-red-500"
                                  : "border-transparent"
                              }`}
                            >
                              {/* CONTENEDOR */}
                              <div className="flex justify-between items-start gap-3">
                                {/* IZQUIERDA */}
                                <div className="flex-1">
                                  {editingId === task.id ? (
                                    <>
                                      <input
                                        value={editingText}
                                        onChange={(e) =>
                                          setEditingText(e.target.value)
                                        }
                                        className="border rounded p-1 w-full mb-1"
                                      />
                                      <input
                                        placeholder="Responsable"
                                        value={editingAssignee}
                                        onChange={(e) =>
                                          setEditingAssignee(e.target.value)
                                        }
                                        className="border rounded p-1 w-full mb-1"
                                      />
                                      <input
                                        type="date"
                                        value={editingDueDate}
                                        onChange={(e) =>
                                          setEditingDueDate(e.target.value)
                                        }
                                        className="border rounded p-1 w-full"
                                      />
                                      <button
                                        onClick={() => saveEdit(task)}
                                        className="mt-2 text-blue-600 text-sm"
                                      >
                                        Guardar
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <p className="font-medium">
                                        {task.title}
                                      </p>

                                      {task.assignee && (
                                        <p className="text-sm text-gray-600">
                                          👤 {task.assignee}
                                        </p>
                                      )}

                                      {task.dueDate && (
                                        <p
                                          className={`text-sm ${
                                            overdue
                                              ? "text-red-600 font-semibold"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          📅 {task.dueDate}
                                        </p>
                                      )}
                                    </>
                                  )}
                                </div>

                                {/* DERECHA - ICONOS */}
                                {editingId !== task.id && (
                                  <div className="flex gap-2 text-lg">
                                    <button
                                      onClick={() => {
                                        setEditingId(task.id);
                                        setEditingText(task.title);
                                        setEditingAssignee(
                                          task.assignee || ""
                                        );
                                        setEditingDueDate(
                                          task.dueDate || ""
                                        );
                                      }}
                                      className="hover:scale-110"
                                    >
                                      ✏️
                                    </button>

                                    <button
                                      onClick={() => removeTask(task)}
                                      className="hover:scale-110"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}

                    {p.placeholder}
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
