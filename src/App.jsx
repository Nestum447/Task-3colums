import { useState } from "react";

export default function App() {
  const [tareas, setTareas] = useState([]);
  const [texto, setTexto] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  // Agregar tarea
  const agregarTarea = () => {
    if (!texto.trim()) return;

    setTareas([
      ...tareas,
      { id: Date.now(), texto }
    ]);

    setTexto("");
  };

  // Borrar tarea
  const borrarTarea = (id) => {
    setTareas(tareas.filter(t => t.id !== id));
  };

  // Activar modo edición
  const editarTarea = (tarea) => {
    setEditId(tarea.id);
    setEditText(tarea.texto);
  };

  // Guardar cambios de edición
  const guardarEdicion = () => {
    if (!editText.trim()) return;

    setTareas(
      tareas.map(t =>
        t.id === editId ? { ...t, texto: editText } : t
      )
    );
    setEditId(null);
    setEditText("");
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
      <h2>Lista de Tareas</h2>

      {/* Input agregar tarea */}
      <div>
        <input
          type="text"
          placeholder="Nueva tarea..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button onClick={agregarTarea} style={{ marginLeft: 5 }}>
          Agregar
        </button>
      </div>

      {/* Lista de tareas */}
      <ul style={{ marginTop: 20 }}>
        {tareas.map((t) => (
          <li key={t.id} style={{ marginBottom: 10 }}>
            {editId === t.id ? (
              <>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <button onClick={guardarEdicion} style={{ marginLeft: 5 }}>
                  Guardar
                </button>
                <button onClick={() => setEditId(null)} style={{ marginLeft: 5 }}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                {t.texto}
                <button
                  onClick={() => editarTarea(t)}
                  style={{ marginLeft: 10 }}
                >
                  Editar
                </button>
                <button
                  onClick={() => borrarTarea(t.id)}
                  style={{ marginLeft: 5 }}
                >
                  Borrar
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
