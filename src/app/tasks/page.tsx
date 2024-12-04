'use client';

import { useEffect, useState } from 'react';
import useAppStore, { Task } from '@/app/state';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../auth';
import useSWR from 'swr';
import { onAuthStateChanged } from 'firebase/auth';
import TaskCard from '../components/TaskCard';
import Link from 'next/link';
import FloatingLogoutButton from '../components/Logout';
import FloatingProgressBar from '../components/Progress';
import { redirect } from 'next/navigation';

const fetchTasks = async (userId: string) => {
    const tasksCollection = collection(db, 'tasks');
    const q = query(tasksCollection, where('assignedTo', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
        taskId: doc.id,
        ...doc.data(),
    })) as Task[];
};

const TasksPage = () => {
    const { tasks, setTasks } = useAppStore();
    const [userId, setUserId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) setUserId(user.uid);
            else {
                setUserId(null);
                redirect('/login');
            }
        });

        return () => unsubscribe();
    }, []);

    const { error, isLoading } = useSWR(userId, () => fetchTasks(userId), {
        onSuccess: (fetchedTasks) => {
            setTasks(fetchedTasks);
        },
    });

    if (isLoading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;
    if (error) return <p className="text-center mt-10 text-gray-500">Failed to fetch tasks.</p>;

    if (!tasks || tasks.length === 0) {
        return (
            <>
                <p className="text-center mt-10 text-gray-500">No tasks assigned yet.</p>
                <div className="flex justify-center mb-6">
                    <Link
                        href="/tasks/assign"
                        className="m-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        Assign New Task
                    </Link>
                </div>
                <FloatingLogoutButton />
            </>
        );
    }

    const filteredTasks = statusFilter === 'all' ? tasks : tasks.filter((task) => task.status === statusFilter);

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Your Tasks</h1>
            {/* Navigation Link to Assign Task Page */}
            <div className="flex justify-center mb-6">
                <Link
                    href="/tasks/assign"
                    className="absolute top-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                    Assign New Task
                </Link>
            </div>
            {/* Filter Dropdown */}
            <div className="absolute top-6 left-6">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-gray-300 text-gray-800 rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
            <div className="flex flex-wrap justify-center gap-6 px-6">
                {filteredTasks.map((task) => (
                    <TaskCard
                        key={task.taskId}
                        imageURL={task.imageURL}
                        taskId={task.taskId}
                        status={task.status}
                        createdAt={task.createdAt}
                    />
                ))}
            </div>
            <FloatingProgressBar />
            <FloatingLogoutButton />
        </div>
    );
};

export default TasksPage;
