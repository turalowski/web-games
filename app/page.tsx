'use client';

import { useEffect, useRef, useState } from "react";

const W = 800; // Canvas width
const H = 600; // Canvas height

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <canvas ref={canvasRef} width={W} height={H} style={{ border: '1px solid white' }} />
    </main>
  );
}
