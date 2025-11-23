import React, { useState, useEffect } from "react";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [selectedTask, setSelectedTask] = useState(null); // tarea seleccionada

  // Cargar localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  // Guardar localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Crear nueva tarea
  const addTask = () => {
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      text: newTask,
      column: "todo"
    };

    setTasks([...tasks, task]);
    setNewTask("");
  };

  // Mover tarea seleccionada a otra columna
  const moveSelectedTask = (columnName) => {
    if (!selectedTask) return;

    setTasks(tasks.map(t =>
      t.id === selectedTask.id ? { ...t, column: columnName } : t
    ));

    setSelectedTask(null);
  };

  // Eliminar tarea
  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Editar
  const editTask = (id) => {
    const newText = prompt("Editar tarea:");
    if (!newText) return;
    setTasks(tasks.map(t => t.id === id ? { ...t, text: newText } : t));
  };

  // Render de columnas
  const renderColumn = (name, title) => (
    <div
      onClick={() => moveSelectedTask(name)}   // mover al tocar la columna
      style={{
        flex: 1,
        background: "#f4f4f4",
        margin: "10px",
        padding: "10px",
        borderRadius: "10px",
        minHeight: "400px"
      }}
    >
      <h2 style={{ textAlign: "center" }}>{title}</h2>

      {tasks
        .filter(t => t.column === name)
        .map(task => (
          <div
            key={task.id}
            onClick={(e) => {
              e.stopPropagation(); // evita mover la tarea al tocarla
              setSelectedTask(task);
            }}
            style={{
              background: selectedTask?.id === task.id ? "#d0ebff" : "white",
              padding: "10px",
              margin: "10px 0",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              border: selectedTask?.id === task.id ? "2px solid #007bff" : "none"
            }}
          >
            <span onClick={(e) => { e.stopPropagation(); editTask(task.id); }}>
              {task.text}
            </span>

            <button
              onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
              style={{
                background: "red",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: "6px",
                marginLeft: "8px"
              }}
            >
              🗑️
            </button>
          </div>
        ))}
    </div>
  );

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center" }}>Gestión de Tareas</h1>

      {/* Input */}
      <div style={{ display: "flex", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Nueva tarea..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid gray"
          }}
        />
        <button
          onClick={addTask}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px"
          }}
        >
          Agregar
        </button>
      </div>

      {/* Columnas */}
      <div style={{ display: "flex", gap: "10px" }}>
        {renderColumn("todo", "To Do")}
        {renderColumn("proceso", "Proceso")}
        {renderColumn("delegadas", "Delegadas")}
      </div>
    </div>
  );
}
