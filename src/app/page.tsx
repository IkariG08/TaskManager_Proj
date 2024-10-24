"use client";
import "./page.scss";
import Card from "@/components/Card";
import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd"; //Importación de libreria de beautiful dnd para lograr el drag n drop visto en clase
import { format, addDays, startOfWeek } from "date-fns"; //Importación de libreria date-fns para conseguir la fecha del dia de hoy y de otras semanas

export default function Home() {
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [daysOfWeek, setDaysOfWeek] = useState(['']);
  const [daySelected, setDaySelected] = useState(''); //UseStates para lograr la funcionalidad de los dias de la semana

  
  useEffect(() => {
    const days = Array.from({ length: 7 }, (_, index) =>
      format(addDays(startDate, index), "EEEE, MMM d")
    );
    setDaysOfWeek(days);

    if (!daySelected) {
      setDaySelected(days[0]); 
    }
  }, [startDate]); //Presentar los dias de la semana actual


  //Funcnión para la configuración de los botones de siguiente o anterior semana 
  const changeStartDate = (isNext: boolean) => {
    //console.log(daySelected);
    if (isNext)
      setStartDate(prevDate => addDays(prevDate, 7)); //Si es el boton de siguiente, ver los siguientes 7 dias
    else
      setStartDate(prevDate => addDays(prevDate, -7)); //Si es el boton de anterior, ver los pasados 7 dias
    //console.log(daySelected);
  };

  const changeSelected = (numW: 4)=>{ //Cambiar los dias de la semana
    setDaySelected(daysOfWeek[numW]);
  } 

  const [todoItems, setTodoItems] = useState([]);
  const [doingItems, setDoingItems] = useState([]); //UseStates para controlar qué hay en cada columna de las tasks
  const [doneItems, setDoneItems] = useState([]);
  const [showModal, setShowModal] = useState(false); //UseState para mostrar el pop up de agregar una nueva task
  const [newTaskTitle, setNewTaskTitle] = useState(""); //Nuevo titulo de la task
  const [newTaskDesc, setNewTaskDesc] = useState(""); //Nueva descripción de la task

  //Variable para saber si se dio click en editar y abrir un diferente modal
  const [editTask, setEditTask] = useState(false);
  const [editRules, setEditRules] = useState({
    id: 0,
    categ: "yo"
  });

  const [theme, setTheme] = useState<"light" | "dark">("light"); //useState para cambiar el tema de la app entre light o dark

  // Función que obtiene el tema guardado en la memoria local
  const changeTheme = (newTheme: typeof theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };


  //Función para hacer el toggle del tema
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
  

  //Función para lograr el drap n drop
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    //Función para mover las tasks tomando como referencia el punto de partida y la columna a donde la queremos desplazar
    const moveItems = (sourceItems: any[], setSource: Function, destItems: any[], setDest: Function) => {
      const sourceCopy = Array.from(sourceItems);
      const destCopy = Array.from(destItems);
      const [movedItem] = sourceCopy.splice(source.index, 1);
      destCopy.splice(destination.index, 0, movedItem);
      setSource(sourceCopy);
      setDest(destCopy);
    };

    //Asignamos las tasks segun la columna
    const columns: { [key: string]: [any[], Function] } = {
      "todo": [todoItems, setTodoItems],
      "doing": [doingItems, setDoingItems],
      "done": [doneItems, setDoneItems],
    };

    //Ordenamos los elementos que hay en una columna una vez que se añade otro
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


  //Función para agregar una task
  const handleAddTask = () => {
    if (newTaskTitle.trim() === "" || newTaskDesc.trim() === "") {
      // Evitar agregar una tarea vacía
      return;
    }
    setTodoItems([...todoItems, { id: `${todoItems.length}`, content: { title: newTaskTitle, description: newTaskDesc, date: daySelected, vis: true, priority: false } }]);
    setNewTaskTitle(""); //Empezar siempre sin nada
    setNewTaskDesc("");
    setShowModal(false); //Quitar el pop up
};

//Función para quitar una task
const removeItem = (id: 1) => {
  setTodoItems(prevItems => prevItems.filter(item => item.id !== id));
  setDoingItems(prevItems => prevItems.filter(item => item.id !== id));
  setDoneItems(prevItems => prevItems.filter(item => item.id !== id));
};
window.removeItem = removeItem;


//Función para editar la task seleccionada
const editItem = (id: number, area: string) => {
  console.log(id);
  if (area==='To Do') {
    const itemToEdit = todoItems[id];
    setNewTaskTitle(itemToEdit.content.title);
    setNewTaskDesc(itemToEdit.content.description); 
    setEditRules({ id: id, categ: 'todo' });
  }else if(area==='Doing'){
    const doingToEdit = doingItems[id];
    setNewTaskTitle(doingToEdit.content.title);
    setNewTaskDesc(doingToEdit.content.description); 
    setEditRules({ id: id, categ: 'doing' });
  }else if(area==='Done'){
    const doneToEdit = doneItems[id];
    setNewTaskTitle(doneToEdit.content.title);
    setNewTaskDesc(doneToEdit.content.description); 
    setEditRules({ id: id, categ: 'done' });
  }
  setEditTask(true);
  setShowModal(true);
};
window.editItem = editItem;



//Función para actualizar la task editada
const handleEditTask = (datos) => {
  if (newTaskTitle.trim() === "" || newTaskDesc.trim() === "") {
    // Evita agregar una tarea vacía
    return;
  }
  if(datos.categ==='todo'){
    todoItems[datos.id].content.title= newTaskTitle;
    todoItems[datos.id].content.description= newTaskDesc;
    
  }else if(datos.categ==='doing'){
    doingItems[datos.id].content.title= newTaskTitle;
    doingItems[datos.id].content.description= newTaskDesc;
  }else if(datos.categ==='done'){
    doneItems[datos.id].content.title= newTaskTitle;
    doneItems[datos.id].content.description= newTaskDesc;
  }
  setNewTaskTitle("");
  setNewTaskDesc("");
  setEditTask(false);
  setShowModal(false);
};


//Función que escucha los eventos del teclado (escape y enter) en el pop up de agregar task
const handleKeyPress = (event: React.KeyboardEvent) => {
  if (event.key === "Enter") {
      event.preventDefault();  // Evita que se envíe el formulario de manera predeterminada
      editTask ? handleEditTask(editRules) : handleAddTask()
  } else if (event.key === "Escape") {
      setShowModal(false); //Cerrar la ventana emergente
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


  function handleSetPriority(itemId: string, area: string) {
    let currentItems;
  
    if (area === 'To Do') {
      currentItems = [...todoItems]; 
    } else if (area === 'Doing') {
      currentItems = [...doingItems];
    } else if (area === 'Done') {
      currentItems = [...doneItems];
    }
  
    const updatedItems = currentItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          content: {
            ...item.content,
            priority: !item.content.priority 
          }
        };
      }
      return item;
    });
  
    const sortedItems = updatedItems.sort((a, b) => {
      return (b.content.priority ? 1 : 0) - (a.content.priority ? 1 : 0);
    });

    if (area === 'To Do') {
      setTodoItems(sortedItems);
    } else if (area === 'Doing') {
      setDoingItems(sortedItems);
    } else if (area === 'Done') {
      setDoneItems(sortedItems);
    }
  }
  window.handleSetPriority = handleSetPriority;

  //PARTE HTML DEL CODIGO
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
      {/*Agregamos las zonas de drop de nuestro componente de card*/}
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
          setEditTask(false);
        }}
      >
        Add task
      </button>

      {/* Pop up para agregar nueva task */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add a new task</h2>
            <input
              type="text"
              placeholder="Task title"
              value={newTaskTitle/*todoItems[0].content.title*/}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <textarea
              placeholder="Task description"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button onClick={() => (editTask ? handleEditTask(editRules) : handleAddTask())}>Add</button>
            <button onClick={() => (setShowModal(false))}>Cancel</button>
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
//handleEditTask(editRules) : handleAddTask()