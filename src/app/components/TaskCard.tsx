import { Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

const TaskCard = ({
    imageURL,
    taskId,
    status,
    createdAt,
}: {
    imageURL: string;
    taskId: string;
    status: string;
    createdAt: Timestamp;
}) => {
    return (
        <Link href={`/tasks/${taskId}`}>
            <div className="bg-white shadow-md rounded-lg overflow-hidden border cursor-pointer hover:shadow-lg w-full max-w-sm mx-auto">
                {/* Image Section */}
                <div className="relative w-full aspect-w-16 aspect-h-9">
                    <Image
                        src={imageURL}
                        alt={`Task ${taskId}`}
                        width={320}
                        height={150}
                        className="object-cover"
                        priority={status === 'Pending'}
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>

                {/* Content Section */}
                <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-600">
                            {new Date(createdAt.seconds * 1000).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                        <span
                            className={`text-sm px-3 py-1 rounded-full ${
                                status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : status === 'in-progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                            {status}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default TaskCard;
