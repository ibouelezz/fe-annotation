'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/app/auth';
import { doc, getDocs, setDoc, collection, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';

interface User {
    uid: string;
    email: string;
}

const AssignTaskPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Fetch users from Firestore
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCollection = collection(db, 'users');
                const querySnapshot = await getDocs(usersCollection);
                const usersData = querySnapshot.docs.map((doc) => ({
                    uid: doc.id,
                    email: doc.data().email,
                })) as User[];
                setUsers(usersData);
            } catch (err) {
                setError('Failed to load users. Please try again.');
            }
        };
        fetchUsers();
    }, []);

    // Handle file input and compress the file
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const originalFile = e.target.files[0];

            try {
                const options = {
                    maxSizeMB: 1, // Max size in MB
                    maxWidthOrHeight: 450, // Max dimensions
                    useWebWorker: true, // Use Web Worker for better performance
                };
                const compressedFile = await imageCompression(originalFile, options);
                console.log('Original size:', originalFile.size / 1024, 'KB');
                console.log('Compressed size:', compressedFile.size / 1024, 'KB');
                setFile(compressedFile);
            } catch (error) {
                setError('Failed to compress image. Please try again.');
            }
        }
    };

    const uploadImage = async () => {
        if (!file) return;
        setUploading(true);

        try {
            const storageRef = ref(storage, `task-images/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                null,
                (error) => {
                    setUploading(false);
                    setError('File upload failed. Please try again.');
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    await saveTask(downloadURL);
                }
            );
        } catch (error) {
            setError('Error uploading file. Please try again.');
            setUploading(false);
        }
    };

    const saveTask = async (imageURL: string) => {
        if (!selectedUser) return;

        const taskId = doc(collection(db, 'tasks')).id;
        const newTask = {
            taskId,
            imageURL,
            status: 'pending',
            assignedTo: selectedUser,
            annotations: [],
            createdAt: new Date(),
        };

        try {
            await setDoc(doc(db, 'tasks', taskId), newTask);
            await updateDoc(doc(db, 'users', selectedUser), {
                tasks: arrayUnion(newTask),
            });
            router.push('/tasks');
        } catch (error) {
            setError('Error assigning task. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        uploadImage();
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 relative">
            {/* Back Button */}
            <a
                href="/tasks"
                className="absolute top-6 left-6 bg-gray-200 text-gray-800 px-4 py-2 rounded-md shadow-sm hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
            >
                ← Back to Tasks
            </a>

            <div className="flex items-center justify-center">
                <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Assign Task</h1>
                    {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                            <select
                                onChange={(e) => setSelectedUser(e.target.value)}
                                value={selectedUser}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            >
                                <option value="">Select a user</option>
                                {users.map((user) => (
                                    <option key={user.uid} value={user.uid}>
                                        {user.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={uploading || !selectedUser || !file}
                            className={`w-full rounded-md py-2 ${
                                uploading || !selectedUser || !file
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-500'
                            }`}
                        >
                            {uploading ? 'Uploading...' : 'Assign Task'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignTaskPage;
