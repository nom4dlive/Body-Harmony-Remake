import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const CanvasWrap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
  z-index: 0;
  opacity: ${({ $opacity }) => $opacity ?? 0.85};
  mix-blend-mode: ${({ $blendMode }) => $blendMode || 'screen'};
  filter: blur(${({ $blur }) => $blur || '2.5px'});
  transform: scale(1.06);
`;

const StyledCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

const VERTEX_SHADER_SRC = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Fragment Shader com Ruído Orgânico de Ouro Líquido / Metal Fundido
// Inspirado em Maeda Organic Flow & R3F Metallic Gold Shader
const FRAGMENT_SHADER_SRC = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  varying vec2 vUv;

  // Função de Ruído Simplex 2D 
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,
                        0.366025403784439,
                       -0.577350269189626,
                        0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    float t = u_time * 0.45;

    // Fluxo laminar com dupla dobra (Domain Warping)
    float q = snoise(uv * 2.5 + vec2(t * 0.3, t * 0.15));
    float r = snoise(uv * 3.2 - vec2(q * 0.6, t * 0.25));
    float f = snoise(uv * 4.0 + vec2(r * 0.8, q * 0.5));

    // Curva de brilho especular (Gold Caustics)
    float shine = pow(clamp(f * 0.5 + 0.5, 0.0, 1.0), 3.0);
    float highlight = pow(clamp(r * 0.5 + 0.5, 0.0, 1.0), 5.0) * 1.4;

    // Paleta de Ouro Nobre Grand Prix
    vec3 goldDark    = vec3(0.48, 0.35, 0.05); // #7A5800
    vec3 goldBase    = vec3(0.72, 0.53, 0.12); // #B8860B
    vec3 goldMid     = vec3(0.83, 0.69, 0.22); // #D4AF37
    vec3 goldBright  = vec3(0.98, 0.75, 0.14); // #FBBF24
    vec3 goldHot     = vec3(1.00, 0.96, 0.82); // #FFF4D0

    vec3 col = mix(goldDark, goldBase, clamp(f * 0.6 + 0.4, 0.0, 1.0));
    col = mix(col, goldMid, clamp(q * 0.8 + 0.2, 0.0, 1.0));
    col = mix(col, goldBright, shine * 0.9);
    col += goldHot * highlight * 0.85;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function LiquidGoldShaderCanvas({ opacity = 0.85, blendMode = 'screen', style = {} }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power' });
    if (!gl) return;

    const createShader = (type, src) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');

    let animationFrameId;
    let startTime = performance.now();

    const resize = () => {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = Math.max(displayWidth, 1);
        canvas.height = Math.max(displayHeight, 1);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    const render = (now) => {
      resize();
      const elapsed = (now - startTime) * 0.001;
      gl.uniform1f(timeLoc, elapsed);
      gl.uniform2f(resLoc, canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <CanvasWrap $opacity={opacity} $blendMode={blendMode} style={style}>
      <StyledCanvas ref={canvasRef} />
    </CanvasWrap>
  );
}
