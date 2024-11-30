'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/app/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { onAuthStateChanged } from 'firebase/auth';
import ImageAnnotator from '../components/ImageAnnotator';

// Type definitions for Task
interface Task {
    taskId: string;
    imageURL: string;
    assignedTo: string;
}

// SWR fetcher using Firebase SDK
const fetchTasks = async (userId: string) => {
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('assignedTo', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
        taskId: doc.id,
        ...doc.data(),
    })) as Task[];
};

const TasksPage = () => {
    const router = useRouter();
    const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Monitor Firebase Auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid); // Set logged-in user ID
            } else {
                setUserId(null);
                router.push('/login'); // Redirect if not logged in
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Use SWR to fetch tasks
    const { data: tasks, error, isLoading } = useSWR(userId ? userId : null, fetchTasks);

    if (isLoading) return <p>Loading tasks...</p>;
    if (error) return <p>Failed to load tasks: {error.message}</p>;

    const handleNext = () => {
        if (currentTaskIndex < tasks.length - 1) {
            setCurrentTaskIndex(currentTaskIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentTaskIndex > 0) {
            setCurrentTaskIndex(currentTaskIndex - 1);
        }
    };

    const currentTask = tasks && tasks[currentTaskIndex];

    return (
        <div>
            {tasks?.length === 0 ? (
                <div>
                    <p>No tasks assigned. Please assign a task.</p>
                    {/* <button onClick={() => router.push('/tasks/assign')}>Go to Assign Task</button> */}
                </div>
            ) : (
                <>
                    <h1>
                        Task {currentTaskIndex + 1} of {tasks?.length}
                    </h1>
                    <div>
                        {/* <img src={currentTask.imageURL} alt="Task" width="600" /> */}
                        <ImageAnnotator imageURL={currentTask?.imageURL} taskId={currentTask?.taskId} />
                    </div>
                    <button onClick={handlePrevious} disabled={currentTaskIndex === 0}>
                        Previous
                    </button>
                    <button onClick={handleNext} disabled={currentTaskIndex === tasks?.length - 1}>
                        Next
                    </button>
                </>
            )}
            <button onClick={() => router.push('/tasks/assign')}>Go to Assign Task</button>
        </div>
    );
};

export default TasksPage;
