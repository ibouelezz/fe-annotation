'use client';

import { useEffect, useRef, useState } from 'react';

interface ImageAnnotatorProps {
    imageURL: string; // URL of the image to be annotated
    taskId: string; // ID of the task associated with the annotation
}

interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

const ImageAnnotator = ({ imageURL, taskId }: ImageAnnotatorProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [rectangles, setRectangles] = useState<Rectangle[]>([]);
    const [undoStack, setUndoStack] = useState<Rectangle[][]>([]);
    const [redoStack, setRedoStack] = useState<Rectangle[][]>([]);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (!imageURL || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.src = imageURL;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);

            // Redraw rectangles
            redrawRectangles(ctx);
        };
    }, [imageURL, rectangles]);

    const redrawRectangles = (ctx: CanvasRenderingContext2D | null) => {
        if (!ctx) return;

        // Redraw rectangles
        rectangles.forEach((rect) => {
            ctx.beginPath();
            ctx.rect(rect.x, rect.y, rect.width, rect.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.stroke();
        });
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        setStartPoint({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
        setIsDrawing(true);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !startPoint) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Redraw the image and existing rectangles
        const img = new Image();
        img.src = imageURL;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            redrawRectangles(ctx);

            // Draw the current rectangle
            const width = currentX - startPoint.x;
            const height = currentY - startPoint.y;
            ctx.beginPath();
            ctx.rect(startPoint.x, startPoint.y, width, height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'blue';
            ctx.stroke();
        };
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !startPoint) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        const newRectangle: Rectangle = {
            x: startPoint.x,
            y: startPoint.y,
            width: endX - startPoint.x,
            height: endY - startPoint.y,
        };

        setUndoStack((prev) => [...prev, rectangles]); // Save current state to undo stack
        setRedoStack([]); // Clear redo stack on new action
        setRectangles((prev) => [...prev, newRectangle]);
        setIsDrawing(false);
        setStartPoint(null);
    };

    const undo = () => {
        if (undoStack.length === 0) return;

        const previousState = undoStack.pop();
        if (previousState) {
            setRedoStack((prev) => [...prev, rectangles]); // Save current state to redo stack
            setRectangles(previousState);
            setUndoStack([...undoStack]); // Update the undo stack
        }
    };

    const redo = () => {
        if (redoStack.length === 0) return;

        const nextState = redoStack.pop();
        if (nextState) {
            setUndoStack((prev) => [...prev, rectangles]); // Save current state to undo stack
            setRectangles(nextState);
            setRedoStack([...redoStack]); // Update the redo stack
        }
    };

    return (
        <div>
            <h2>Annotate Image</h2>
            {imageURL ? (
                <>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        style={{ border: '1px solid black', cursor: 'crosshair' }}
                    ></canvas>
                    <div style={{ marginTop: '10px' }}>
                        <button onClick={undo} disabled={undoStack.length === 0}>
                            Undo
                        </button>
                        <button onClick={redo} disabled={redoStack.length === 0}>
                            Redo
                        </button>
                    </div>
                </>
            ) : (
                <p>Loading image...</p>
            )}
        </div>
    );
};

export default ImageAnnotator;
