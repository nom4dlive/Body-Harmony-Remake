import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const ParticleCanvas = styled.canvas`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1;
`;

export default function GoldDustParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;
    let animationFrameId;

    function resize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      init();
    }

    window.addEventListener('resize', resize, { passive: true });

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseOut = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      scrollVelocity = (currentScrollY - lastScrollY) * 0.12;
      lastScrollY = currentScrollY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseout', handleMouseOut, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.6;
        this.density = Math.random() * 25 + 1;
        this.opacity = Math.random() * 0.5 + 0.15;
        const r = Math.floor(Math.random() * 35) + 215; // 215-250
        const g = Math.floor(Math.random() * 35) + 165; // 165-200
        const b = Math.floor(Math.random() * 30) + 40;  // 40-70
        this.color = `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4 - 0.15; // Sutil subida natural
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        this.x += this.vx;
        this.y += this.vy - scrollVelocity;

        // Efeito magnético / repulsão com cursor
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 140;

        if (distance < maxDistance && distance > 0) {
          const force = (maxDistance - distance) / maxDistance;
          const directionX = (dx / distance) * force * this.density * 0.5;
          const directionY = (dy / distance) * force * this.density * 0.5;
          this.x -= directionX;
          this.y -= directionY;
        }

        // Wrap infinito nas bordas
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        this.draw();
      }
    }

    function init() {
      particles = [];
      const numberOfParticles = Math.floor((width * height) / 18000);
      for (let i = 0; i < Math.min(numberOfParticles, 75); i++) {
        particles.push(new Particle());
      }
    }

    init();

    function animate() {
      ctx.clearRect(0, 0, width, height);
      scrollVelocity *= 0.94; // Amortecimento suave
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return <ParticleCanvas ref={canvasRef} />;
}

