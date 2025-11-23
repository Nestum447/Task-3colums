import React, { useState, useEffect } from "react";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  // Cargar tareas desde localStorage al inicio
  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  // Guardar tareas en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Crear tarea
  const addTask = () => {
    if (!newTask.trim()) return;
    const task = {
      id: Date.now(),
      text: newTask,
      column: "todo",
    };
    setTasks([...tasks, task]);
    setNewTask("");
  };

  // Mover tarea entre columnas
  const onDragStart = (e, id) => {
    e.dataTransfer.setData("id", id);
  };

  const onDrop = (e, column) => {
    const id = e.dataTransfer.getData("id");
    setTasks(tasks.map(t => t.id == id ? { ...t, column } : t));
  };

  const allowDrop = (e) => e.preventDefault();

  // Eliminar tarea
  const deleteTask = (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
  };

  // Editar tarea
  const editTask = (id) => {
    const newText = prompt("Editar tarea:");
    if (!newText) return;
    setTasks(tasks.map(t => t.id === id ? { ...t, text: newText } : t));
  };

  const renderColumn = (name, title) => (
    <div
      onDrop={(e) => onDrop(e, name)}
      onDragOver={allowDrop}
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
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
            style={{
              background: "white",
              padding: "10px",
              margin: "10px 0",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
            }}
          >
            <span onClick={() => editTask(task.id)} style={{ flex: 1 }}>
              {task.text}
            </span>

            <button
              onClick={() => deleteTask(task.id)}
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

      {/* Input para nueva tarea */}
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
