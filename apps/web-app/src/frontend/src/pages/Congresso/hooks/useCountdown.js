import { useState, useEffect } from 'react';

/**
 * Hook: useCountdown
 * Retorna tempo restante até uma data-alvo como { days, hours, minutes, seconds }.
 * Congresso Brasileiro de Musculação Elétrica — 07 de Novembro de 2026.
 */
function useCountdown(targetDate) {
  const getTimeLeft = () => {
    if (!targetDate) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };
    }

    const safeDateStr = typeof targetDate === 'string'
      ? targetDate.trim().replace(' ', 'T')
      : targetDate;

    const parsedTarget = new Date(safeDateStr).getTime();
    if (isNaN(parsedTarget)) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };
    }

    const now = new Date().getTime();
    const diff = parsedTarget - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      expired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

export default useCountdown;
