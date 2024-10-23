import { Box, Typography } from "@mui/material";
import "./Card.scss";
import React, { useState , useEffect } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";

interface IDropsProps {
  id: string;
  title: string;
  date: string;
  items: { id: string, content: { title: string, description: string, date: string, vis: boolean } }[];
}

export default function Card(props: IDropsProps) {
  const { id, title, items: initialItems } = props;
  const [items, setItems] = useState(initialItems); 

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  function handleDelete(id: string) {
    if (window.removeItem) {
      window.removeItem(id);
    } else {
      console.error("error al encontrar remove");
    }
  }

  function handleEdit(id: string) {
    if (window.editItem) {
      console.log('por favor');
      window.editItem(id);
    } else {
      console.log("error al encontrar edit");
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
              const isVisi= item.content.date===props.date;
                
              return (
                isVisi && item.content.vis && (
                <Draggable draggableId={item.id} key={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`Draggable-root ${snapshot.isDragging ? "dragging" : ""}`
                      }
                    >
                      <strong className="task-title">{item.content.title}</strong>
                      <p className="task-desc">{item.content.description}</p>
                      <div className="del-task" onClick={() => handleDelete(item.id)}>0</div>
                      <div className="edi-task" onClick={() => handleEdit(item.id)}>8</div>
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
