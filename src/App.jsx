import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function App() {

  // ---------------------------
  //   LOCAL STORAGE: CARGAR
  // ---------------------------
  const loadTasks = () => {
    const saved = localStorage.getItem("tasks-board");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  };

  const [tasks, setTasks] = useState(
    loadTasks() || {
      todo: [
        { id: "1", text: "Tarea 1" },
        { id: "2", text: "Tarea 2" },
      ],
      proceso: [{ id: "3", text: "Tarea 3 en proceso" }],
      delegadas: [{ id: "4", text: "Tarea delegada" }],
    }
  );

  const [newTask, setNewTask] = useState("");

  // ---------------------------
  //   LOCAL STORAGE: GUARDAR
  // ---------------------------
  useEffect(() => {
    localStorage.setItem("tasks-board", JSON.stringify(tasks));
  }, [tasks]);

  // ---------------------------
  //   DRAG & DROP
  // ---------------------------
  const handleDragEnd = (result) => {
    const sourceColumn = result.source.droppableId;

    // 🔥 CANASTA: si suelta en el área "delete", eliminar tarea
    if (result.destination?.droppableId === "delete") {
      setTasks((prev) => ({
        ...prev,
        [sourceColumn]: prev[sourceColumn].filter(
          (t, index) => index !== result.source.index
        ),
      }));
      return;
    }

    // 🔥 Si no hay destino (soltó fuera) → NO elimina ahora (solo canasta)
    if (!result.destination) return;

    const destColumn = result.destination.droppableId;

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

    const newId = Date.now().toString();
    const newItem = { id: newId, text: newTask };

    setTasks({
      ...tasks,
      todo: [...tasks.todo, newItem],
    });

    setNewTask("");
  };

  // ---------------------------
  //   UI
  // ---------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Gestor de Tareas</h1>

      {/* Input para nueva tarea */}
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

          {/* Columna To Do */}
          <Droppable droppableId="todo">
            {(provided) => (
              <div
                className="bg-white p-4 rounded shadow min-h-[300px]"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h2 className="text-xl font-semibold mb-3 text-blue-700">To Do</h2>

                {tasks.todo.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        className="p-3 bg-blue-100 rounded mb-2 shadow cursor-grab active:cursor-grabbing"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {task.text}
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Columna Proceso */}
          <Droppable droppableId="proceso">
            {(provided) => (
              <div
                className="bg-white p-4 rounded shadow min-h-[300px]"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h2 className="text-xl font-semibold mb-3 text-yellow-600">
                  En Proceso
                </h2>

                {tasks.proceso.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        className="p-3 bg-yellow-100 rounded mb-2 shadow cursor-grab active:cursor-grabbing"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {task.text}
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Columna Delegadas */}
          <Droppable droppableId="delegadas">
            {(provided) => (
              <div
                className="bg-white p-4 rounded shadow min-h-[300px]"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h2 className="text-xl font-semibold mb-3 text-green-700">
                  Delegadas
                </h2>

                {tasks.delegadas.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        className="p-3 bg-green-100 rounded mb-2 shadow cursor-grab active:cursor-grabbing"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {task.text}
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>

        </div>

        {/* 🗑️ CANASTA PARA BORRAR */}
        <Droppable droppableId="delete">
          {(provided) => (
            <div
              className="mt-10 mx-auto w-40 h-40 rounded-full bg-red-200 border-4 border-red-500 flex items-center justify-center text-2xl font-bold shadow"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              🗑️
              {provided.placeholder}
            </div>
          )}
        </Droppable>

      </DragDropContext>
    </div>
  );
}
