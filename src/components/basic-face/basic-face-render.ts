/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
type BasicFaceProps = {
  ctx: CanvasRenderingContext2D;
  mouthScale: number;
  eyeScale: number;
  color?: string;
};

const eye = (
  ctx: CanvasRenderingContext2D,
  pos: [number, number],
  radius: number,
  scaleY: number
) => {
  // Ensure positive radius and scale
  const safeRadius = Math.max(1, radius);
  const safeScaleY = Math.max(0.1, scaleY);

  ctx.save();
  ctx.translate(pos[0], pos[1]);
  ctx.scale(1, safeScaleY);
  ctx.beginPath();
  ctx.arc(0, 0, safeRadius, 0, Math.PI * 2);
  ctx.restore();
  ctx.fill();
};

export function renderBasicFace(props: BasicFaceProps) {
  const {
    ctx,
    eyeScale: eyesOpenness,
    mouthScale: mouthOpenness,
    color,
  } = props;
  const { width, height } = ctx.canvas;

  // Ensure minimum canvas size to prevent negative calculations
  if (width <= 0 || height <= 0) {
    return;
  }

  // Clear the canvas
  ctx.clearRect(0, 0, width, height);

  // Draw the background circle (ensure positive radius)
  const faceRadius = Math.max(10, width / 2 - 20);
  ctx.fillStyle = color || 'white';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, faceRadius, 0, Math.PI * 2);
  ctx.fill();

  const eyesCenter = [width / 2, height / 2.425];
  const eyesOffset = Math.max(5, width / 15);
  const eyeRadius = Math.max(1, width / 30);
  const eyesPosition: Array<[number, number]> = [
    [eyesCenter[0] - eyesOffset, eyesCenter[1]],
    [eyesCenter[0] + eyesOffset, eyesCenter[1]],
  ];

  // Draw the eyes (ensure positive radius)
  ctx.fillStyle = 'black';
  const eyeScale = Math.max(0.1, eyesOpenness + 0.1);
  eye(ctx, eyesPosition[0], eyeRadius, eyeScale);
  eye(ctx, eyesPosition[1], eyeRadius, eyeScale);

  const mouthCenter = [width / 2, (height / 2.875) * 1.55];
  const mouthWidth = Math.max(5, width / 10);
  const mouthHeight = Math.max(1, (height / 5) * mouthOpenness + 10);

  // Draw the mouth (ensure positive dimensions)
  ctx.save();
  ctx.translate(mouthCenter[0], mouthCenter[1]);
  const mouthScale = Math.max(0.1, mouthOpenness + height * 0.002);
  ctx.scale(1, mouthScale);
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.ellipse(0, 0, mouthWidth, mouthHeight, 0, 0, Math.PI, false);
  ctx.ellipse(0, 0, mouthWidth, mouthHeight * 0.45, 0, 0, Math.PI, true);
  ctx.fill();
  ctx.restore();
}
