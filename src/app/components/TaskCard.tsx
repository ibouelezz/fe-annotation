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
    createdAt: string;
}) => {
    return (
        <Link href={`/tasks/${taskId}`}>
            {/* <Link href={{ pathname: `/tasks/${taskId}`, query: { annotations: JSON.stringify(annotations) } }}> */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden border w-64 cursor-pointer hover:shadow-lg">
                <div className="relative aspect-w-16 aspect-h-9">
                    <Image
                        src={imageURL}
                        alt={`Task ${taskId}`}
                        width={256}
                        height={144}
                        className="object-cover"
                        priority={status === 'Pending'}
                    />
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-bold text-gray-800">id: </h2>
                        <span
                            className={`text-sm px-3 py-1 rounded-full ${
                                status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                            {status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">Created at: </p>
                </div>
            </div>
        </Link>
    );
};

export default TaskCard;
