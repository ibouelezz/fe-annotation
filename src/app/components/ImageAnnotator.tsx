'use client';

import { useEffect, useRef, useState } from 'react';
import { Annotation } from '../state';

const ImageAnnotator = ({ task, newAnnotations, setNewAnnotations }) => {
    const { imageURL } = task;

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [undoStack, setUndoStack] = useState<Annotation[][]>([]);
    const [redoStack, setRedoStack] = useState<Annotation[][]>([]);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

    const [tempRectangle, setTempRectangle] = useState<Annotation | null>(null);

    useEffect(() => {
        // if (!imageURL || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.src = imageURL;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);

            redrawRectangles(ctx);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageURL, newAnnotations]);

    const redrawRectangles = (ctx: CanvasRenderingContext2D | null) => {
        if (!ctx) return;

        // Redraw rectangles
        newAnnotations?.forEach((rect) => {
            ctx.beginPath();
            ctx.rect(rect.x, rect.y, rect.width, rect.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.stroke();

            // Draw the text above the rectangle
            ctx.fillStyle = 'black';
            ctx.font = '16px Arial';
            ctx.fillText(rect.text, rect.x + 5, rect.y - 5); // Place text above the rectangle
        });
    };

    const getCoordinates = (
        event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
        canvas: HTMLCanvasElement
    ): { x: number; y: number } => {
        const rect = canvas.getBoundingClientRect();

        if ('touches' in event) {
            // Handle touch events
            const touch = event.touches[0]; // Get the first touch point
            return {
                x: touch?.clientX - rect.left,
                y: touch?.clientY - rect.top,
            };
        } else {
            // Handle mouse events
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            };
        }
    };

    const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const isTouch = 'touches' in e; // Check if it's a touch event
        const { x, y } = isTouch
            ? getCoordinates(e as React.TouchEvent<HTMLCanvasElement>, canvas)
            : getCoordinates(e as React.MouseEvent<HTMLCanvasElement>, canvas);

        setStartPoint({ x, y });
        setIsDrawing(true);
    };

    const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !startPoint) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const isTouch = 'touches' in e; // Check if it's a touch event
        const { x, y } = isTouch
            ? getCoordinates(e as React.TouchEvent<HTMLCanvasElement>, canvas)
            : getCoordinates(e as React.MouseEvent<HTMLCanvasElement>, canvas);

        // Redraw the image and existing rectangles
        const img = new Image();
        img.src = imageURL;

        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            redrawRectangles(ctx);

            const width = x - startPoint.x;
            const height = y - startPoint.y;

            setTempRectangle({
                x: startPoint.x,
                y: startPoint.y,
                width,
                height,
                text: '',
            });

            ctx.beginPath();
            ctx.rect(startPoint.x, startPoint.y, width, height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'blue';
            ctx.stroke();
        };
    };

    const handleEnd = () => {
        if (!isDrawing || !startPoint) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        let text: string;
        do {
            text = prompt('Your text:');

            if (text === null) {
                // alert('Text is required for annotations. The last shape will be removed.');
                setIsDrawing(false);
                setStartPoint(null);
                setNewAnnotations((prev) => [...prev]);
                return;
            }
        } while (text.trim() === '');

        const newRectangle: Annotation = {
            ...tempRectangle,
            text,
        };

        setNewAnnotations((prev) => [...prev, newRectangle]);
        setTempRectangle(null);
        setUndoStack((prev) => [...prev, newAnnotations]);
        setRedoStack([]); // Clear redo stack on new action
        setIsDrawing(false);
        setStartPoint(null);
    };

    const undo = () => {
        if (undoStack.length === 0) return;

        const previousState = undoStack.pop();
        if (previousState) {
            setRedoStack((prev) => [...prev, newAnnotations]); // Save current state to redo stack
            setUndoStack([...undoStack]); // Update the undo stack
            setNewAnnotations(previousState);
        }
    };

    const redo = () => {
        if (redoStack.length === 0) return;

        const nextState = redoStack.pop();
        if (nextState) {
            setUndoStack((prev) => [...prev, newAnnotations]); // Save current state to undo stack
            setRedoStack([...redoStack]); // Update the redo stack
            setNewAnnotations(nextState);
        }
    };

    return (
        <div className="relative flex justify-center items-center bg-gray-100 p-6 h-max">
            {imageURL ? (
                <>
                    <div className="relative overflow-hidden border border-gray-300 rounded-md">
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={600}
                            onMouseDown={handleStart}
                            onMouseMove={handleMove}
                            onMouseUp={handleEnd}
                            onTouchStart={handleStart}
                            onTouchMove={handleMove}
                            onTouchEnd={handleEnd}
                            className="w-full h-full bg-gray-50 cursor-crosshair"
                        ></canvas>
                    </div>
                    <div className="flex flex-col gap-4 absolute bottom-6 left-6">
                        <button
                            onClick={undo}
                            disabled={undoStack.length === 0}
                            className={`px-4 py-2 rounded-md shadow-sm ${
                                undoStack.length === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                            }`}
                        >
                            Undo
                        </button>
                        <button
                            onClick={redo}
                            disabled={redoStack.length === 0}
                            className={`px-4 py-2 rounded-md shadow-sm ${
                                redoStack.length === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                            }`}
                        >
                            Redo
                        </button>
                    </div>
                </>
            ) : (
                <p className="text-center text-gray-500">Loading image...</p>
            )}
        </div>
    );
};

export default ImageAnnotator;
