import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const ShaderContainer = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  background: #0c0f0f;

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

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    vec2 uv = v_texCoord;
    
    vec3 blackPiano = vec3(0.015, 0.018, 0.02);
    vec3 gold = vec3(0.85, 0.70, 0.28);
    
    float drift = 0.0;
    for(float i = 0.0; i < 50.0; i++) {
        float x = hash(i);
        float y = fract(hash(i + 123.4) - u_time * (0.08 + hash(i + 5.0) * 0.15));
        
        vec2 p = vec2(x, y);
        float dist = length(uv - p);
        
        float size = 0.0012 + hash(i * 10.0) * 0.0025;
        drift += smoothstep(size, 0.0, dist);
    }
    
    vec3 color = blackPiano;
    color = mix(color, gold, drift * 0.85);
    
    // Glossy reflection simulated by a smooth diagonal light beam
    float gloss = smoothstep(0.35, 0.65, uv.x + uv.y - 0.5 + sin(u_time * 0.35) * 0.12);
    color += vec3(0.045) * gloss;
    
    // Subtle mouse reaction
    vec2 mouseNorm = u_mouse / u_resolution;
    float mouseGlow = smoothstep(0.4, 0.0, length(uv - mouseNorm));
    color += gold * mouseGlow * 0.04;
    
    // Vignette for depth
    float vignette = 1.0 - length(uv - 0.5) * 1.1;
    color *= smoothstep(0.0, 0.8, vignette);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function AuraShaderBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, powerPreference: 'low-power' }) ||
               canvas.getContext('experimental-webgl');
    if (!gl) return;

    let animationFrameId;
    let targetMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let currentMouse = { x: targetMouse.x, y: targetMouse.y };

    function syncSize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor((canvas.clientWidth || window.innerWidth) * dpr);
      const h = Math.floor((canvas.clientHeight || window.innerHeight) * dpr);
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
      targetMouse.x = e.clientX;
      targetMouse.y = window.innerHeight - e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let startTime = performance.now();

    function render() {
      const now = performance.now();
      const elapsed = (now - startTime) * 0.001;

      // Smooth mouse damping
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
    <ShaderContainer>
      <canvas ref={canvasRef} />
    </ShaderContainer>
  );
}

