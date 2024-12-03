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
    setTasks: (tasks) =>
        set(() => ({
            tasks,
            incompleteTaskIds: tasks.filter((task) => task.taskId !== 'completed').map((task) => task.taskId),
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
            let updatedTask = state.tasks.find((task) => task.taskId === taskId);
            updatedTask.annotations = annotations;
            updatedTask.status = 'completed';
            return { currentAnnotations: updatedTask.annotations };
        }),
}));

export default useAppStore;
