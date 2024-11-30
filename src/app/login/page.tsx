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
                    role: 'user', // Default role
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
        <div>
            <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p>{error}</p>}
                <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
        </div>
    );
}
