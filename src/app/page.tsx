"use client";
import "./page.scss";
import Card from "@/components/Card";
import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { format, addDays, startOfWeek } from "date-fns";

export default function Home() {
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [daysOfWeek, setDaysOfWeek] = useState(['']);
  const [daySelected, setDaySelected] = useState('');
  
  useEffect(() => {
    const days = Array.from({ length: 7 }, (_, index) =>
      format(addDays(startDate, index), "EEEE, MMM d")
    );
    setDaysOfWeek(days);

    // Set daySelected to the first day of the week or maintain the current selection
    if (!daySelected) {
      setDaySelected(days[0]); // Initially set to the first day of the week
    }
  }, [startDate]);

  //funcnión para la configuración de los botones de siguiente o anterior semana 
  const changeStartDate = (isNext: boolean) => {
    //console.log(daySelected);
    if (isNext)
      setStartDate(prevDate => addDays(prevDate, 7));
    else
      setStartDate(prevDate => addDays(prevDate, -7));
    //console.log(daySelected);
  };

  const changeSelected = (numW: 4)=>{
    setDaySelected(daysOfWeek[numW]);
  }

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

  /*// Escuchar eventos de teclado globalmente
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
  */

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    changeTheme(newTheme);
  };

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
    if (newTaskTitle.trim() === "" || newTaskDesc.trim() === "") {
      // Evita agregar una tarea vacía
      return;
    }

    setTodoItems([...todoItems, { id: `${todoItems.length}`, content: { title: newTaskTitle, description: newTaskDesc, date: daySelected } }]);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setShowModal(false);
};


const handleKeyPress = (event: React.KeyboardEvent) => {
  if (event.key === "Enter") {
      event.preventDefault();  // Evita que se envíe el formulario de manera predeterminada
      handleAddTask();
  } else if (event.key === "Escape") {
      setShowModal(false);
  }
};

  useEffect(() => {
    if (showModal) {
      window.addEventListener("keydown", handleKeyPress);
    } else {
      window.removeEventListener("keydown", handleKeyPress);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [showModal]);

  return (
    <div className="page-root">
      {/* Título del día y carrusel */}
      <div className="header">
        <h1 className="today">{daySelected}</h1>
        <div className="btns-prev-next">
          <div className="prev-next" onClick={() => changeStartDate(false)}>
            <h3>Previous Week</h3>
          </div>
          <div className="prev-next" onClick={() => changeStartDate(true)}>
            <h3>Next Week</h3>
          </div>
        </div>
        <div className="carousel">
          {daysOfWeek.map((day, index) => (
            <div key={index} className={`carousel-day ${day === daySelected ? "active" : ""}`} onClick={() => changeSelected(index)}>
              {day}
            </div>
          ))}
        </div>

      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="columns">
          <Card id="todo" title="To Do" date={daySelected} items={todoItems} />
          <Card id="doing" title="Doing" date={daySelected}  items={doingItems} />
          <Card id="done" title="Done" date={daySelected}  items={doneItems} />
        </div>
      </DragDropContext>

      {/* Botón para añadir una task */}
      <button
        className="add-task-button"
        onClick={() => {
          setNewTaskTitle("");  // Restablece el valor del título
          setNewTaskDesc("");   // Restablece el valor de la descripción
          setShowModal(true);   // Muestra el modal
        }}
      >
        Add task
      </button>

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
              onKeyDown={handleKeyPress}
            />
            <textarea
              placeholder="Task description"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button onClick={handleAddTask}>Add</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Botón para cambiar el tema */}
      <button className="toggle-theme-button" onClick={toggleTheme}>
      <img src="images/brightness.png" alt="Toggle dark mode" />
      </button>
    </div>
  );
}
