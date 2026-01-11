import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";
import type { Column as ColumnType, Task, Id } from "../types";

interface Props {
    column: ColumnType;
    tasks: Task[];
    createTask: (columnId: Id) => void;
    deleteTask: (id: Id) => void;
    updateTask: (id: Id, content: string) => void;
}

function ColumnContainer({ column, tasks, createTask, deleteTask, updateTask }: Props) {
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
    });

    const tasksIds = tasks.map((t) => t.id);

    return (
        <div className="kanban-column" ref={setNodeRef}>
            <div className="column-header">
                <div className="column-title">
                    {column.title}
                    <span className="task-count">{tasks.length}</span>
                </div>
            </div>

            <div className="column-content">
                <SortableContext items={tasksIds} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                        />
                    ))}
                </SortableContext>
            </div>

            <button className="add-task-btn" onClick={() => createTask(column.id)}>
                <Plus size={18} />
                Add Card
            </button>
        </div>
    );
}

export default ColumnContainer;
