import { Box, Typography } from "@mui/material";
import "./Card.scss";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { format, addDays, startOfWeek } from "date-fns";

interface IDropsProps {
  id: string;
  title: string;
  date: string;
  items: { id: string, content: { title: string, description: string, date: string, } }[];
}

export default function Card(props: IDropsProps) {
  const { items, id, title } = props;
  const today = format(new Date(), "EEEE, MMM d");

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
                isVisi && (
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
