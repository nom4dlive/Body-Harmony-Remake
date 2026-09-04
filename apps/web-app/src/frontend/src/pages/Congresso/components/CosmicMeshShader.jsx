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

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(27.1, 61.7))) * 43758.5453);
  }

  void main() {
    vec2 uv = v_texCoord;
    vec2 mouseNorm = u_mouse / u_resolution;

    vec3 darkBase = vec3(0.04, 0.045, 0.045);
    vec3 goldChampagne = vec3(0.95, 0.82, 0.45);

    float grid = 0.0;
    vec2 st = uv * 6.0;
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float point = 0.0;
    for(int y = -1; y <= 1; y++) {
      for(int x = -1; x <= 1; x++) {
        vec2 neighbor = vec2(float(x), float(y));
        vec2 p = vec2(hash(i_st + neighbor), hash(i_st + neighbor + vec2(1.0, 3.0)));
        p = 0.5 + 0.35 * sin(u_time * 0.5 + 6.2831 * p);

        vec2 diff = neighbor + p - f_st;
        float dist = length(diff);
        point += smoothstep(0.06, 0.0, dist);
      }
    }

    vec3 color = darkBase;
    color += goldChampagne * point * 0.6;

    float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    vignette = clamp(pow(16.0 * vignette, 0.35), 0.0, 1.0);
    color *= vignette;

    gl_FragColor = vec4(color, 0.8);
  }
`;

export default function CosmicMeshShader() {
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

