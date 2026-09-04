import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  border-radius: inherit;

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

const VS_SOURCE = `
  attribute vec2 a_position;
  varying vec2 v_texCoord;
  void main() {
    v_texCoord = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FS_SOURCE = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  varying vec2 v_texCoord;

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 4; i++) {
      v += a * smoothNoise(p);
      p = m * p + u_time * 0.08;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = v_texCoord;
    vec2 mouseNorm = u_mouse / u_resolution;

    vec2 p = uv * 2.5;
    p += mouseNorm * 0.15;

    float f1 = fbm(p + fbm(p + u_time * 0.15));
    float f2 = fbm(p + f1 + u_time * 0.08);

    vec3 blackPiano = vec3(0.06, 0.06, 0.06);
    vec3 goldBase = vec3(0.83, 0.69, 0.22);
    vec3 goldHighlight = vec3(0.98, 0.88, 0.48);

    vec3 color = mix(blackPiano, goldBase, f1 * 0.35);
    color = mix(color, goldHighlight, f2 * 0.25);

    // Subtle edge fade for card embedding
    float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    vignette = clamp(pow(16.0 * vignette, 0.3), 0.0, 1.0);
    color *= vignette;

    gl_FragColor = vec4(color, 0.85);
  }
`;

export default function GoldenNebulaFluidShader() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, powerPreference: 'low-power' }) ||
               canvas.getContext('experimental-webgl');
    if (!gl) return;

    let animationFrameId;
    let targetMouse = { x: canvas.clientWidth / 2, y: canvas.clientHeight / 2 };
    let currentMouse = { x: targetMouse.x, y: targetMouse.y };

    function syncSize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.floor((canvas.clientWidth || 400) * dpr);
      const h = Math.floor((canvas.clientHeight || 300) * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(syncSize)
      : null;

    if (resizeObserver) resizeObserver.observe(canvas);
    syncSize();

    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compileShader(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = compileShader(gl.FRAGMENT_SHADER, FS_SOURCE);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        targetMouse.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
        targetMouse.y = (1.0 - (e.clientY - rect.top) / rect.height) * canvas.height;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let startTime = performance.now();

    function render() {
      const now = performance.now();
      const elapsed = (now - startTime) * 0.001;

      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.05;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.05;

      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, elapsed);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, currentMouse.x, currentMouse.y);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      if (resizeObserver) resizeObserver.disconnect();
      if (buf) gl.deleteBuffer(buf);
      if (prog) gl.deleteProgram(prog);
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
    };
  }, []);

  return (
    <Container>
      <canvas ref={canvasRef} />
    </Container>
  );
}

