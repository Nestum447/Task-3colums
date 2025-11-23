import { useState } from "react";

export default function App() {
  const [tareas, setTareas] = useState({
    todo: [],
    proceso: [],
    delegadas: []
  });

  const [texto, setTexto] = useState("");
  const [editando, setEditando] = useState(null);
  const [editText, setEditText] = useState("");

  // -----------------------------
  //   AGREGAR TAREA
  // -----------------------------
  const agregarTarea = () => {
    if (!texto.trim()) return;

    setTareas((prev) => ({
      ...prev,
      todo: [...prev.todo, { id: Date.now(), texto }]
    }));

    setTexto("");
  };

  // -----------------------------
  //   BORRAR TAREA
  // -----------------------------
  const borrarTarea = (columna, id) => {
    setTareas((prev) => ({
      ...prev,
      [columna]: prev[columna].filter((t) => t.id !== id),
    }));
  };

  // -----------------------------
  //   EDITAR TAREA
  // -----------------------------
  const iniciarEdicion = (tarea, columna) => {
    setEditando({ id: tarea.id, columna });
    setEditText(tarea.texto);
  };

  const guardarEdicion = () => {
    setTareas((prev) => {
      const col = editando.columna;

      return {
        ...prev,
        [col]: prev[col].map((t) =>
          t.id === editando.id ? { ...t, texto: editText } : t
        )
      };
    });

    setEditando(null);
    setEditText("");
  };

  // -----------------------------
  //   DRAG & DROP
  // -----------------------------

  const onDragStart = (e, tarea, columna) => {
    e.dataTransfer.setData("tareaId", tarea.id);
    e.dataTransfer.setData("columna", columna);
  };

  const onDrop = (e, columnaDestino) => {
    const id = Number(e.dataTransfer.getData("tareaId"));
    const columnaOrigen = e.dataTransfer.getData("columna");

    if (columnaOrigen === columnaDestino) return;

    const tareaMovida = tareas[columnaOrigen].find((t) => t.id === id);

    setTareas((prev) => ({
      ...prev,
      [columnaOrigen]: prev[columnaOrigen].filter((t) => t.id !== id),
      [columnaDestino]: [...prev[columnaDestino], tareaMovida]
    }));
  };

  const allowDrop = (e) => e.preventDefault();

  // -----------------------------
  //   UI TARJETA
  // -----------------------------
  const renderTarea = (t, columna) => {
    const enEdicion = editando && editando.id === t.id;

    return (
      <div
        key={t.id}
        draggable={!enEdicion}
        onDragStart={(e) => onDragStart(e, t, columna)}
        style={{
          background: "#fff",
          padding: 10,
          marginBottom: 10,
          borderRadius: 8,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
        }}
      >
        {enEdicion ? (
          <>
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={{ width: "90%" }}
            />
            <br />
            <button onClick={guardarEdicion}>Guardar</button>
            <button onClick={() => setEditando(null)} style={{ marginLeft: 5 }}>
              Cancelar
            </button>
          </>
        ) : (
          <>
            <p>{t.texto}</p>

            <button onClick={() => iniciarEdicion(t, columna)}>
              Editar
            </button>

            <button
              onClick={() => borrarTarea(columna, t.id)}
              style={{ marginLeft: 5 }}
            >
              Borrar
            </button>
          </>
        )}
      </div>
    );
  };

  // -----------------------------
  //   RENDER
  // -----------------------------
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        padding: 20,
        background: "#f5f5f5",
        minHeight: "100vh"
      }}
    >
      {/* INPUT NUEVA TAREA */}
      <div style={{ position: "fixed", top: 10, left: 10 }}>
        <input
          placeholder="Nueva tarea"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button onClick={agregarTarea} style={{ marginLeft: 5 }}>
          Agregar
        </button>
      </div>

      {/* COLUMNAS */}
      {["todo", "proceso", "delegadas"].map((col) => (
        <div
          key={col}
          onDragOver={allowDrop}
          onDrop={(e) => onDrop(e, col)}
          style={{
            flex: 1,
            background: "#eaeaea",
            padding: 10,
            borderRadius: 10,
            marginTop: 60
          }}
        >
          <h3 style={{ textTransform: "capitalize", textAlign: "center" }}>
            {col === "todo"
              ? "To-Do"
              : col === "proceso"
              ? "Proceso"
              : "Delegadas"}
          </h3>

          {tareas[col].map((t) => renderTarea(t, col))}
        </div>
      ))}
    </div>
  );
}
