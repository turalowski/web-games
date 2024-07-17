'use client';


import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const W = 800; // Canvas width
const H = 600; // Canvas height

export default function Home() {

  const canvasRef = useRef(null);
  const [ballX, setBallX] = useState(W/2);
  const [ballY, setBallY] = useState(H/2);
  const [ballSpeedX, setBallSpeedX] = useState(20);
  const [ballSpeedY, setBallSpeedY] = useState(0);
  const [paddle1Y, setPaddle1Y] = useState(150);
  const [paddle2Y, setPaddle2Y] = useState(150);
  const [winningScreenShowed, setWinningScreenShowed] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [requestId, setRequestId] = useState(0);

  const WINNING_SCORE = 3;
  const PADDLE_HEIGHT = 100;
  const PADDLE_THICKNESS = 10;
  const computerLevel = 9; // range 0 - 10

  const handleMouseMove = (e) => {
    const { y } = calculateMousePos(e);
    setPaddle1Y(y - PADDLE_HEIGHT / 2);
  };

  const handleClick = () => {
    if (!winningScreenShowed) {
      return;
    }
    setWinningScreenShowed(false);
    setPlayerScore(0);
    setComputerScore(0);
  };

  const calculateMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const root = document.documentElement;
    const mouseX = e.clientX - rect.left - root.scrollLeft;
    const mouseY = e.clientY - rect.top - root.scrollTop;
    return { x: mouseX, y: mouseY };
  };

  const computerMovement = () => {
    const speed = Math.abs(ballSpeedY);
    const indent = speed > computerLevel ? -10 : 40;
    setPaddle2Y(ballY - indent);
  };

  const moveEverything = () => {
    if (winningScreenShowed) {
      return;
    }

    const hitThePaddle1 = ballY > paddle1Y && ballY < paddle1Y + PADDLE_HEIGHT;
    const hitThePaddle2 = ballY > paddle2Y && ballY < paddle2Y + PADDLE_HEIGHT;

    computerMovement();
    setBallX((prevX) => prevX + ballSpeedX);
    setBallY((prevY) => prevY + ballSpeedY);

    if (ballX > W - PADDLE_THICKNESS) {
      if (hitThePaddle2) {
        console.log(1)
        setBallSpeedX(-ballSpeedX);
      } else if (ballX > W) {
        console.log(2)
        setPlayerScore((prevScore) => prevScore + 1);
        resetBall();
      }
    }

    if (ballX < PADDLE_THICKNESS) {
      if (hitThePaddle1) {
        setBallSpeedX(-ballSpeedX);
        const deltaY = ballY - (paddle1Y + PADDLE_HEIGHT / 2);
        setBallSpeedY(deltaY * 0.2);
      } else if (ballX < 0) {
        setComputerScore((prevScore) => prevScore + 1);
        resetBall();
      }
    }

    if (ballY > H || ballY < 0) {
      setBallSpeedY(-ballSpeedY);
    }
  };

  const drawNet = (ctx) => {
    for (let i = 0; i < H; i += 40) {
      drawRect(ctx, W / 2 - 1, i, 2, 20, 'white');
    }
  };

  const drawEverything = (ctx) => {
    drawRect(ctx, 0, 0, W, H, 'black');
    drawNet(ctx);
    drawRect(ctx, 0, paddle1Y, PADDLE_THICKNESS, PADDLE_HEIGHT, 'green');
    drawRect(ctx, W - PADDLE_THICKNESS, paddle2Y, PADDLE_THICKNESS, PADDLE_HEIGHT, 'green');
    drawCircle(ctx, ballX, ballY, 15, 'red');

    if (winningScreenShowed) {
      ctx.fillStyle = 'white';
      if (playerScore === WINNING_SCORE) {
        ctx.fillText('You Won!', 100, 100);
      } else if (computerScore >= WINNING_SCORE) {
        ctx.fillText('Computer Won!', W - 150, 100);
      }
      ctx.fillText('click to continue', 300, 310);
      return;
    }

    ctx.fillStyle = 'white';
    ctx.fillText(playerScore, 100, 100);
    ctx.fillText(computerScore, W - 100, 100);
  };

  const drawRect = (ctx, x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };

  const drawCircle = (ctx, x, y, rad, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2, false);
    ctx.fill();
  };

  const resetBall = () => {
    if (playerScore === WINNING_SCORE || computerScore === WINNING_SCORE) {
      setWinningScreenShowed(true);
    }
    setBallX(W / 2);
    setBallY(H / 2);
    setBallSpeedY(0);
    setPaddle2Y(150);
    setPaddle1Y(150);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const loop = () => {
        moveEverything();
        drawEverything(ctx);
        setRequestId(requestAnimationFrame(loop));
    };

    const start = () => {
      setRequestId(requestAnimationFrame(loop));
    };

    start();

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      if (requestId) {
        cancelAnimationFrame(requestId);
      }
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [requestId, playerScore, computerScore]);
    
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <canvas ref={canvasRef} width={W} height={H} style={{ border: '1px solid white' }} />
    </main>
  );
}
