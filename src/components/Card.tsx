import { Box, Typography } from "@mui/material";
import "./Card.scss";
import React, { useState, useEffect } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";


/*
  it simportant to run this command in the terminal 
  so it can install some assests 

      npm install @mui/icons-material @mui/material @emotion/react @emotion/styled


*/
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface IDropsProps {
  id: string;
  title: string;
  date: string;
  items: { id: string, content: { title: string, description: string, date: string, vis: boolean, priority: boolean } }[];
}

export default function Card(props: IDropsProps) {
  const { id, title, items: initialItems } = props;
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);


  /*
  
    las siguientes funciones están conectadas en page.tsx, su lógica está ahí,
    aquí solo se ponen para mandar parámetros importantes a esas funciones
    una es para el manejo de eliminación de tasks, otra para editarlas y la última 
    para setear el nivel de importancia.
  
  */
  function handleDelete(id: string) {
    if (window.removeItem) {
      window.removeItem(id);
    } else {
      console.error("error al encontrar remove");
    }
  }

  function handleEdit(id: number, area: string) {
    if (window.editItem) {
      window.editItem(id, area);
    } else {
      console.log("error al encontrar edit");
    }
  }

  function handlePriority(itemId: string, area: string) {
    if (window.handleSetPriority) {
      console.log('entró');
      window.handleSetPriority(itemId, area);
    } else {
      console.log("error al encontrar priority");
    }
  }

  return (
    <Box className="Card-root">
      <Typography className="column-title">{title}</Typography>
      <Droppable droppableId={id}>
        {(provided) => (
          <div
            className="Drop-zone"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {items.map((item, index) => {
              //para saber dependiendo de la fecha cuál task mostrar y cuál no 
              const isVisi = item.content.date === props.date;

              return (
                isVisi && item.content.vis && (
                  <Draggable draggableId={item.id} key={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`Draggable-root ${snapshot.isDragging ? "dragging" : ""}`}
                      >
                        <strong className="task-title">{item.content.title}</strong>
                        <p className="task-desc">{item.content.description}</p>
                        <div className="del-task" onClick={() => handleDelete(item.id)}>
                          <DeleteIcon className="icone" fontSize="small" />
                        </div>
                        <div className="edi-task" onClick={() => handleEdit(index, title)}>
                          <EditIcon className="icone" fontSize="small" />
                        </div>
                        <div className="priorita" onClick={() => handlePriority(item.id, title)}>
                          <div className={`priorita-menor ${item.content.priority ? "active" : ''}`} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                )
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Box>
  );
}
