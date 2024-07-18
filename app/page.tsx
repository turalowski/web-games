'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const WIDTH = 800;
const HEIGHT = 600;
const BALL_RADIUS = 15;

const drawRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
};

const drawNet = (ctx: CanvasRenderingContext2D) => {
  for (let i = 0; i < HEIGHT; i += 40) {
    drawRect(ctx, WIDTH / 2 - 1, i, 2, 20, 'white');
  }
};

const drawCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  ctx.fill();
};

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const [ballX, setBallX] = useState(WIDTH / 2);
  const [ballY, setBallY] = useState(HEIGHT / 2);
  const [ballSpeedX, setBallSpeedX] = useState(5);
  const [ballSpeedY, setBallSpeedY] = useState(5);

  const moveAll = () => {

    if(ballX <= 0) {
      setBallSpeedX(5)
    }

    if(ballY <= 0) {
      setBallSpeedY(5)
    }

    if (ballX + BALL_RADIUS >= WIDTH) {
      setBallSpeedX(-5);
    }

    if (ballY + BALL_RADIUS >= HEIGHT) {
      setBallSpeedY(-5);
    }

    setBallX(prevBallX => prevBallX + ballSpeedX);
    setBallY(prevBallY => prevBallY + ballSpeedY);
  };

  const drawAll = (ctx: CanvasRenderingContext2D) => {
    drawRect(ctx, 0, 0, WIDTH, HEIGHT, 'black');
    drawNet(ctx);
    drawCircle(ctx, ballX, ballY, BALL_RADIUS, 'red');
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawAll(ctx);
        moveAll();
      }
    }
  };

  const animate = (time: number) => {
    requestRef.current = requestAnimationFrame(animate);
    loop();
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  },);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{ border: '1px solid white' }}
      />
    </main>
  );
}
