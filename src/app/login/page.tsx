'use client';

import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/app/auth';

export default function AuthPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    // Toggle between login and signup form
    const [isLogin, setIsLogin] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isLogin) {
                // Login the user
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Create a new user
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Storing the user in Firestore
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    tasks: [], // Store an empty array for now
                    userId: user.uid,
                    createdAt: new Date(),
                });
            }
            router.push('/tasks'); // Redirect to tasks page on success
        } catch (err) {
            setError('Error: ' + err.message);

            // Rollback: Delete user from Firebase Authentication if Firestore save fails
            if (auth.currentUser) {
                await auth.currentUser.delete(); // This deletes the user from Firebase Auth
            }

            alert('User registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">{isLogin ? 'Login' : 'Sign Up'}</h1>

                {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="mt-4 w-full text-sm text-blue-600 hover:underline focus:outline-none text-center"
                >
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                </button>
            </div>
        </div>
    );
}
