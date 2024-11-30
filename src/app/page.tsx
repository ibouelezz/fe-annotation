'use client'; // Ensure this is a Client Component

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use updated routing
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/app/auth';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.push('/tasks'); // Redirect to tasks
            } else {
                router.push('/login'); // Redirect to login
            }
        });

        return () => unsubscribe(); // Cleanup subscription
    }, [router]);

    return <p>Checking authentication...</p>;
}
