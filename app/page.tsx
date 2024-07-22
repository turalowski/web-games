'use client';

import { useEffect, useRef } from 'react';

const WIDTH = 800;
const HEIGHT = 600;
const BALL_RADIUS = 15;
const PADDLE_THICKNESS = 10;
const PADDLE_HEIGHT = 100;
const PADDLE_START_Y = HEIGHT / 2 - PADDLE_HEIGHT / 2 + 180;

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

  const ballPosition = useRef({
    x: WIDTH / 2,
    y: HEIGHT / 2,
    speedX: 5,
    speedY: 5,
  });

  const resetBall = () => {
    ballPosition.current = {
      x: WIDTH / 2,
      y: HEIGHT / 2,
      speedX: 5,
      speedY: 5,
    };
  };

  const paddle1 = useRef({
    x: 0,
    y: PADDLE_START_Y,
  });

  const paddle2 = useRef({
    x: WIDTH - PADDLE_THICKNESS,
    y: PADDLE_START_Y,
  });

  const score = useRef({
    player1: 0,
    player2: 0,
  });

  const checkCollisions = () => {
    let { x, y, speedX, speedY } = ballPosition.current;
    let { x: paddle1X, y: paddle1Y } = paddle1.current;
    let { x: paddle2X, y: paddle2Y } = paddle2.current;

    if (x - BALL_RADIUS < PADDLE_THICKNESS) {
      if (y > paddle1Y && y < paddle1Y + PADDLE_HEIGHT) {
        speedX = -speedX;
        // Change speedY to add variation when bouncing off the paddle
        speedY += (y - (paddle1Y + PADDLE_HEIGHT / 2)) * 0.1;
        ballPosition.current = { ...ballPosition.current, speedX, speedY };
      } else {
        score.current = {
          ...score.current,
          player2: score.current.player2 + 1,
        };
        resetBall();
      }
    }

    if (x + BALL_RADIUS > WIDTH - PADDLE_THICKNESS) {
      if (y > paddle2Y && y < paddle2Y + PADDLE_HEIGHT) {
        speedX = -speedX;
        // Change speedY to add variation when bouncing off the paddle
        speedY += (y - (paddle2Y + PADDLE_HEIGHT / 2)) * 0.1;
        ballPosition.current = { ...ballPosition.current, speedX, speedY };
      } else {
        score.current = {
          ...score.current,
          player1: score.current.player1 + 1,
        };
        resetBall();
      }
    }

    if (y - BALL_RADIUS < 0 || y + BALL_RADIUS > HEIGHT) {
      speedY = -speedY;
      ballPosition.current = { ...ballPosition.current, speedY };
    }
  };

  const moveAll = () => {
    let { x, y, speedX, speedY } = ballPosition.current;

    x += speedX;
    y += speedY;
    ballPosition.current = { x, y, speedX, speedY };
    computerMovement();
  };

  const drawScore = (ctx: CanvasRenderingContext2D) => {
    const { player1, player2 } = score.current;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Roboto';

    ctx.fillText(String(player1), 100, 100);
    ctx.fillText(String(player2), WIDTH - 100, 100);
  };

  const drawAll = (ctx: CanvasRenderingContext2D) => {
    const { x: paddle1X, y: paddle1Y } = paddle1.current;
    const { x: paddle2X, y: paddle2Y } = paddle2.current;
    const { x, y } = ballPosition.current;
    drawRect(ctx, 0, 0, WIDTH, HEIGHT, 'black');
    drawNet(ctx);
    drawCircle(ctx, x, y, BALL_RADIUS, 'red');
    drawRect(ctx, paddle1X, paddle1Y, PADDLE_THICKNESS, PADDLE_HEIGHT, 'green');
    drawRect(ctx, paddle2X, paddle2Y, PADDLE_THICKNESS, PADDLE_HEIGHT, 'green');
    drawScore(ctx);
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        checkCollisions();
        moveAll();
        drawAll(ctx);
      }
    }
  };

  const computerMovement = () => {
    const { speedY, y } = ballPosition.current;
    const speed = Math.abs(speedY);
    const currentYPosition = paddle2.current.y;
    const ballYPosition = y;
    let newYPosition = currentYPosition;

    const easy = 0.9;

    // Move paddle towards the ball with reaction speed proportional to difficulty
    if (ballYPosition > currentYPosition + PADDLE_HEIGHT / 2) {
      newYPosition += easy * speed;
    } else if (ballYPosition < currentYPosition + PADDLE_HEIGHT / 2) {
      newYPosition -= easy * speed;
    }

    // Ensure the paddle doesn't move out of bounds
    newYPosition = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, newYPosition));

    paddle2.current = { ...paddle2.current, y: newYPosition };
  };

  const handleMouseMove = (e: MouseEvent) => {
    const newYPosition = e.offsetY - PADDLE_HEIGHT / 2;
    if (newYPosition >= 0 && newYPosition <= HEIGHT - PADDLE_HEIGHT) {
      paddle1.current = { ...paddle1.current, y: newYPosition };
    }
  };

  const animate = (time: number) => {
    loop();
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    requestRef.current = requestAnimationFrame(animate);
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

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
