import { create } from 'zustand';

export interface User {
    userId: string;
    email: string;
    tasks: Task[];
}

export interface Annotation {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
}

export interface Task {
    taskId: string;
    assignedTo: string;
    imageURL: string;
    annotations: Annotation[];
    status: string; // later enum
    createdAt;
}

interface AppState {
    users: User[]; // All users
    tasks: Task[]; // All tasks
    incompleteTaskIds: string[];
    nextIncompleteTaskId: string;
    currentTaskIndex: number; // Index of the current task
    currentAnnotations: Annotation[]; // Annotations for the current task
    setTasks: (tasks: Task[]) => void; // Set all tasks
    getTaskById: (taskId: string) => Task | undefined; // Selector for task by taskId
    setCurrentTaskIndex: (index: number) => void; // Change task index
    updateTaskAnnotations: (taskId: string, annotations: Annotation[]) => void; // Update current annotations
}

const useAppStore = create<AppState>((set, get) => ({
    users: [],
    tasks: [],
    currentTaskIndex: 0,
    currentAnnotations: [],
    incompleteTaskIds: [],
    nextIncompleteTaskId: null,
    setTasks: (tasks) =>
        set(() => ({
            tasks,
            incompleteTaskIds: tasks.filter((task) => task.status !== 'completed').map((task) => task.taskId),
        })),
    getTaskById: (taskId) => {
        return get().tasks.find((task) => task.taskId === taskId) || null;
    },
    setCurrentTaskIndex: (index) =>
        set((state) => ({
            currentTaskIndex: index,
            currentAnnotations: state.tasks[index]?.annotations || [],
        })),
    updateTaskAnnotations: (taskId, annotations) =>
        set((state) => {
            const updatedTasks = state.tasks.map((task) => {
                if (task.taskId === taskId) {
                    return {
                        ...task,
                        annotations: annotations,
                        status: 'completed',
                    };
                }
                return task;
            });

            const incompleteTaskIds = updatedTasks
                .filter((task) => task.status !== 'completed')
                .map((task) => task.taskId);

            return {
                incompleteTaskIds,
                tasks: updatedTasks,
                currentAnnotations: annotations,
            };
        }),
}));

export default useAppStore;
