'use client';

import { useEffect, useRef, useState } from 'react';
import { Annotation, Task } from '../state';

interface ImageAnnotatorProps {
    task: Task;
    newAnnotations: Annotation[];
    setNewAnnotations;
}

const ImageAnnotator = ({ task, newAnnotations, setNewAnnotations }) => {
    const { imageURL } = task;

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [undoStack, setUndoStack] = useState<Annotation[][]>([]);
    const [redoStack, setRedoStack] = useState<Annotation[][]>([]);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

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

        let text: string;
        do {
            text = prompt('Your text:');

            if (text === null) {
                alert('Text is required for annotations. The last shape will be removed.');
                setIsDrawing(false);
                setStartPoint(null);
                setNewAnnotations((prev) => [...prev]);
                return;
            }
        } while (text.trim() === '');

        let newRectangle: Annotation = {
            x: startPoint.x,
            y: startPoint.y,
            width: endX - startPoint.x,
            height: endY - startPoint.y,
            text,
        };

        setNewAnnotations((prev) => [...prev, newRectangle]);
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
