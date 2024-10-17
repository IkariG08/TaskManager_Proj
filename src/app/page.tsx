"use client";
import "./page.scss";
import Card from "@/components/Card";
import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { format, addDays, startOfWeek } from "date-fns";

export default function Home() {
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const daysOfWeek = Array.from({ length: 7 }, (_, index) =>
    format(addDays(startDate, index), "EEEE, MMM d")
  );
  const today = format(new Date(), "EEEE, MMM d");

  const [todoItems, setTodoItems] = useState([]);
  const [doingItems, setDoingItems] = useState([]);
  const [doneItems, setDoneItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");

  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Función para cambiar el tema
  const changeTheme = (newTheme: typeof theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Escuchar eventos de teclado globalmente
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Digit1") {
        changeTheme("light");
        console.log("light theme");
      } else if (event.code === "Digit2") {
        changeTheme("dark");
        console.log("dark theme");
      }
    };

    // Añadir el listener al cargar el componente
    window.addEventListener("keydown", handleKeyDown);

    // Remover el listener al desmontar el componente
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Cargar el tema almacenado al montar el componente
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme as typeof theme);
  }, []);

  // Aplicar el tema al HTML cuando cambia
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const moveItems = (sourceItems: any[], setSource: Function, destItems: any[], setDest: Function) => {
      const sourceCopy = Array.from(sourceItems);
      const destCopy = Array.from(destItems);
      const [movedItem] = sourceCopy.splice(source.index, 1);
      destCopy.splice(destination.index, 0, movedItem);
      setSource(sourceCopy);
      setDest(destCopy);
    };

    const columns: { [key: string]: [any[], Function] } = {
      "todo": [todoItems, setTodoItems],
      "doing": [doingItems, setDoingItems],
      "done": [doneItems, setDoneItems],
    };

    const [sourceItems, setSourceItems] = columns[source.droppableId];
    const [destItems, setDestItems] = columns[destination.droppableId];

    if (source.droppableId === destination.droppableId) {
      const updatedItems = Array.from(sourceItems);
      const [movedItem] = updatedItems.splice(source.index, 1);
      updatedItems.splice(destination.index, 0, movedItem);
      setSourceItems(updatedItems);
    } else {
      moveItems(sourceItems, setSourceItems, destItems, setDestItems);
    }
  };

  const handleAddTask = () => {
    setTodoItems([...todoItems, { id: `${todoItems.length}`, content: { title: newTaskTitle, description: newTaskDesc } }]);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setShowModal(false);
  };

  return (
    <div className="page-root">
      {/* Título del día y carrusel */}
      <div className="header">
        <h1 className="today">{today}</h1>
        <div className="carousel">
          {daysOfWeek.map((day, index) => (
            <div key={index} className={`carousel-day ${day === today ? "active" : ""}`}>
              {day}
            </div>
          ))}
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="columns">
          <Card id="todo" title="To Do" items={todoItems} />
          <Card id="doing" title="Doing" items={doingItems} />
          <Card id="done" title="Done" items={doneItems} />
        </div>
      </DragDropContext>

      {/* Botón para añadir una task */}
      <button className="add-task-button" onClick={() => setShowModal(true)}>Add task</button>

      {/* Modal para agregar nueva task */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add a new task</h2>
            <input
              type="text"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <textarea
              placeholder="Task description"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
            />
            <button onClick={handleAddTask}>Add</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
