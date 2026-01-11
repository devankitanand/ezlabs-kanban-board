import { useState, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import type { Task, Id } from "../types";

interface Props {
    task: Task;
    deleteTask: (id: Id) => void;
    updateTask: (id: Id, content: string) => void;
}


export function TaskCardContent({
    task,
    deleteTask,
    updateTask,
    style,
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    editMode,
    toggleEditMode,
}: {
    task: Task;
    deleteTask: (id: Id) => void;
    updateTask: (id: Id, content: string) => void;
    style?: React.CSSProperties;
    attributes?: any;
    listeners?: any;
    setNodeRef?: (node: HTMLElement | null) => void;
    isDragging?: boolean;
    editMode?: boolean;
    toggleEditMode?: () => void;
}) {
    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="task-card dragging"
            />
        );
    }

    if (editMode && toggleEditMode) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className="task-card"
            >
                <textarea
                    value={task.content}
                    autoFocus
                    placeholder="Task content here"
                    onBlur={toggleEditMode}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            toggleEditMode();
                        }
                    }}
                    onChange={(e) => updateTask(task.id, e.target.value)}
                />
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={toggleEditMode}
            className="task-card"
        >
            <div style={{ whiteSpace: "pre-wrap" }}>
                {task.content || "Untitled Task"}
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                }}
                className="delete-btn"
                aria-label="Delete task"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
}

function TaskCard({ task, deleteTask, updateTask }: Props) {
    const [editMode, setEditMode] = useState(false);

    const sortableData = useMemo(() => ({
        type: "Task",
        task,
    }), [task]);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: sortableData,
        disabled: editMode,
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    const toggleEditMode = () => {
        setEditMode((prev) => !prev);
    };

    return (
        <TaskCardContent
            task={task}
            deleteTask={deleteTask}
            updateTask={updateTask}
            style={style}
            attributes={attributes}
            listeners={listeners}
            setNodeRef={setNodeRef}
            isDragging={isDragging}
            editMode={editMode}
            toggleEditMode={toggleEditMode}
        />
    );
}

export default TaskCard;
