import { signOut } from 'firebase/auth';
import { auth } from '@/app/auth';
import Link from 'next/link';

export default function FloatingLogoutButton() {
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <Link href="/login">
            <button
                onClick={handleLogout}
                className="fixed bottom-6 right-6 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
                Logout
            </button>
        </Link>
    );
}
