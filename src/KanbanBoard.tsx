import { useState } from "react";
import { createPortal } from "react-dom";
import {
    DndContext,
    DragOverlay,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";
import ColumnContainer from "./components/ColumnContainer";
import TaskCard from "./components/TaskCard";
import type { Column, Task, Id } from "./types";
import "./KanbanBoard.css";

const defaultCols: Column[] = [
    { id: "todo", title: "Todo" },
    { id: "doing", title: "In Progress" },
    { id: "done", title: "Done" },
];

const defaultTasks: Task[] = [
    { id: "1", columnId: "todo", content: "Create initial project plan" },
    { id: "2", columnId: "todo", content: "Design landing page" },
    { id: "3", columnId: "todo", content: "Review codebase structure" },
    { id: "4", columnId: "doing", content: "Implement authentication" },
    { id: "5", columnId: "doing", content: "Set up database schema" },
    { id: "6", columnId: "doing", content: "Fix navbar bugs" },
    { id: "7", columnId: "done", content: "Organize project repository" },
    { id: "8", columnId: "done", content: "Write API documentation" },
];

function KanbanBoard() {
    const [columns] = useState<Column[]>(defaultCols);
    const [tasks, setTasks] = useState<Task[]>(defaultTasks);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const createTask = (columnId: Id) => {
        const newTask: Task = {
            id: uuidv4(),
            columnId,
            content: `New Task`,
        };
        setTasks([...tasks, newTask]);
    };

    const deleteTask = (id: Id) => {
        setTasks(tasks.filter((t) => t.id !== id));
    };

    const updateTask = (id: Id, content: string) => {
        setTasks(tasks.map((t) => (t.id === id ? { ...t, content } : t)));
    };

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
        }
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        if (!isActiveTask) return;

        // Dropping a Task over another Task
        if (isActiveTask && isOverTask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);

                if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
                    const newTasks = [...tasks];
                    newTasks[activeIndex] = {
                        ...newTasks[activeIndex],
                        columnId: newTasks[overIndex].columnId,
                    };
                    return arrayMove(newTasks, activeIndex, overIndex);
                }

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        const isOverColumn =
            over.data.current?.type === "Column" ||
            columns.some((c) => c.id === overId);

        // Dropping a Task over a Column
        if (isActiveTask && isOverColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                if (tasks[activeIndex].columnId !== overId) {
                    const newTasks = [...tasks];
                    newTasks[activeIndex] = {
                        ...newTasks[activeIndex],
                        columnId: overId as Id,
                    };
                    return arrayMove(newTasks, activeIndex, activeIndex);
                }
                return tasks;
            });
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        // Logic for reordering within same column is handled in dragOver mostly,
        // but dragEnd ensures final state consistency.
    }

    return (
        <div className="kanban-board">
            <h1 className="kanban-title">Question 2 — Kanban Board Component</h1>
            <DndContext
                sensors={sensors}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
            >
                <div className="kanban-columns">
                    {columns.map((col) => (
                        <ColumnContainer
                            key={col.id}
                            column={col}
                            tasks={tasks.filter((t) => t.columnId === col.id)}
                            createTask={createTask}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                        />
                    ))}
                </div>

                {createPortal(
                    <DragOverlay>
                        {activeTask && (
                            <TaskCard
                                task={activeTask}
                                deleteTask={deleteTask}
                                updateTask={updateTask}
                            />
                        )}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    );
}

export default KanbanBoard;
