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
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = v_texCoord;
    vec2 mouse = u_mouse / u_resolution;
    
    vec3 blackPiano = vec3(0.02, 0.025, 0.025);
    vec3 gold = vec3(0.95, 0.79, 0.31);
    
    float particles = 0.0;
    for(int i = 0; i < 30; i++) {
        float t = u_time * 0.25 + float(i) * 1.4;
        vec2 pos = vec2(hash(vec2(float(i), 1.0)), hash(vec2(float(i), 2.0)));
        
        // Circular movement around original random pos
        pos += vec2(cos(t), sin(t)) * 0.12;
        
        // React to mouse
        float mouseDist = length(uv - mouse);
        pos += (uv - mouse) * smoothstep(0.35, 0.0, mouseDist) * 0.12;
        
        float dist = length(uv - pos);
        particles += smoothstep(0.004, 0.0, dist);
    }
    
    vec3 color = blackPiano;
    color = mix(color, gold, particles * 0.9);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function VipShaderParticles() {
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
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor((canvas.clientWidth || 600) * dpr);
      const h = Math.floor((canvas.clientHeight || 400) * dpr);
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

      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.06;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.06;

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

