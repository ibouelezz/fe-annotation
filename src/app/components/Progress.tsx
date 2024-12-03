import { useState, useEffect } from 'react';
import useAppStore from '@/app/state';

export default function FloatingProgressBar() {
    const { tasks } = useAppStore();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (tasks.length > 0) {
            const completedTasks = tasks.filter((task) => task.status === 'completed').length;
            setProgress((completedTasks / tasks.length) * 100);
        }
    }, [tasks]);

    return (
        <div className="fixed bottom-6 left-6 w-64 bg-gray-200 shadow-2xl rounded-full overflow-hidden">
            <div
                className="h-6 bg-blue-600 text-white text-xs font-semibold flex items-center justify-center rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
            >
                {tasks.length > 0 ? `${Math.round(progress)}% ` : 'No Tasks Assigned'}
            </div>
        </div>
    );
}
