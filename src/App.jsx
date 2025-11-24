import React, { useState, useEffect } from "react";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [draggingTask, setDraggingTask] = useState(null);

  const columns = ["todo", "proceso", "delegadas"];

  // -------------------------
  // LOAD FROM LOCAL STORAGE
  // -------------------------
  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  // -------------------------
  // SAVE TO LOCAL STORAGE
  // -------------------------
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // -------------------------
  // ADD TASK
  // -------------------------
  const addTask = () => {
    if (newTask.trim() === "") return;
    const task = {
      id: Date.now(),
      text: newTask,
      column: "todo"
    };
    setTasks([...tasks, task]);
    setNewTask("");
  };

  // -------------------------
  // DELETE TASK
  // -------------------------
  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // -------------------------
  // EDIT TASK
  // -------------------------
  const editTask = (id) => {
    const newText = prompt("Editar tarea:");
    if (!newText) return;

    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, text: newText } : t))
    );
  };

  // -------------------------
  // DRAG START
  // -------------------------
  const handleDragStart = (task) => {
    setDraggingTask(task);
  };

  // -------------------------
  // DROP IN COLUMN
  // -------------------------
  const handleDrop = (column) => {
    if (!draggingTask) return;

    setTasks(
      tasks.map((t) =>
        t.id === draggingTask.id ? { ...t, column } : t
      )
    );
    setDraggingTask(null);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>

      {/* INPUT */}
      <h2>Gestor de Tareas (3 columnas)</h2>
      <div style={{ display: "flex", gap: 10 }}>
        <input
          style={{ flex: 1, padding: 10 }}
          placeholder="Nueva tarea"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button onClick={addTask}>Agregar</button>
      </div>

      {/* COLUMNS */}
      <div
        style={{
          display: "flex",
          marginTop: 20,
          gap: 20,
        }}
      >
        {columns.map((col) => (
          <div
            key={col}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col)}
            style={{
              flex: 1,
              padding: 15,
              background: "#f0f0f0",
              borderRadius: 10,
              minHeight: 400,
            }}
          >
            <h3 style={{ textTransform: "capitalize" }}>{col}</h3>

            {tasks
              .filter((t) => t.column === col)
              .map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  style={{
                    padding: 10,
                    background: "white",
                    borderRadius: 8,
                    marginBottom: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                >
                  <span>{task.text}</span>

                  <div style={{ display: "flex", gap: 10 }}>
                    {/* Edit Button */}
                    <button
                      onClick={() => editTask(task.id)}
                      style={{
                        background: "#3498db",
                        color: "white",
                        border: "none",
                        borderRadius: 5,
                        padding: "5px 10px",
                      }}
                    >
                      ✏️
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      style={{
                        background: "#e74c3c",
                        color: "white",
                        border: "none",
                        borderRadius: 5,
                        padding: "5px 10px",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
