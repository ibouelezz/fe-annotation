'use client';

import { db } from '@/app/auth';
import ImageAnnotator from '@/app/components/ImageAnnotator';
import useAppStore, { Annotation, Task } from '@/app/state';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { redirect, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
// import useSWR from 'swr';

// const fetchTaskById = async (taskId: string): Promise<Task> => {
//     const docRef = doc(db, 'tasks', taskId);
//     const docSnap = await getDoc(docRef);

//     if (!docSnap.exists()) {
//         throw new Error('Task not found');
//     }

//     const data = docSnap.data();
//     return {
//         taskId: data.taskId,
//         assignedTo: data.assignedTo,
//         imageURL: data.imageURL,
//         annotations: data.annotations,
//         status: data.status,
//         createdAt: data.createdAt,
//     };
// };

const TaskPage = () => {
    const { taskId } = useParams();
    const { getTaskById, incompleteTaskIds, updateTaskAnnotations } = useAppStore();
    const nextTaskId = incompleteTaskIds && incompleteTaskIds.pop();

    const [task, setTask] = useState<Task>(null);
    const [newAnnotations, setNewAnnotations] = useState<Array<Annotation>>([]);

    useEffect(() => {
        console.log({ taskId });
        if (taskId) {
            const taskData = getTaskById(taskId as string); // Fetch the task by taskId
            // TODO: because this fetches task from local state, /tasks needs to be hit first
            // We can extend this logic by fetching first from local storage then from firestore right away
            setTask(taskData);
            setNewAnnotations(taskData?.annotations || []);
        }
    }, [taskId, getTaskById]);

    // const { error, isLoading } = useSWR(taskId, () => fetchTaskById(taskId as string), {
    //     onSuccess: (fetchedTask) => {
    //         setTask(fetchedTask);
    //         setNewAnnotations(fetchedTask.annotations);
    //     },
    // });

    if (!task) {
        return (
            <>
                <div className="text-center text-gray-500">Task not found</div>
                <button className="mb-4 text-gray-600 hover:text-gray-800 underline" onClick={() => redirect('/tasks')}>
                    ← Back to Tasks
                </button>
            </>
        );
    }

    const saveAnnotations = async () => {
        // TODO: check if there is a difference between the annotation arrays to save a request
        if (!taskId) return;

        const taskRef = doc(db, 'tasks', taskId as string);
        await updateDoc(taskRef, { annotations: newAnnotations, status: 'completed' });
        updateTaskAnnotations(taskId as string, newAnnotations);
    };

    return (
        <div className="min-h-screen max-h-screen bg-gray-100 p-10 relative overflow-hidden">
            {/* Back Button */}
            <Link
                href="/tasks"
                className="absolute top-6 left-6 bg-gray-200 text-gray-800 px-4 py-2 rounded-md shadow-sm hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
            >
                ← Back to Tasks
            </Link>

            {/* Image Annotator Section */}
            <div className="bg-white shadow-lg rounded-lg p-6 mx-auto max-w-4xl">
                <ImageAnnotator task={task} newAnnotations={newAnnotations} setNewAnnotations={setNewAnnotations} />
            </div>

            {/* Next Button */}
            {nextTaskId && (
                <div className="absolute bottom-6 right-6">
                    <Link href={`/tasks/${nextTaskId}`}>
                        <button
                            onClick={saveAnnotations}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            Next Task →
                        </button>
                    </Link>
                </div>
            )}

            {/* Save Button */}
            {!nextTaskId && (
                <div className="absolute bottom-6 right-6">
                    <button
                        onClick={async () => await saveAnnotations().then(() => redirect('/tasks'))}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        Save
                    </button>
                </div>
            )}
        </div>
    );
};

export default TaskPage;
