import React, { useEffect } from 'react';

/**
 * DirectPaymentRedirect (Antigo StoneCheckoutModal — PLAN-162)
 * Descontinuado: Redireciona diretamente para o link de checkout seguro sem iframe (evitando bloqueios de CSP do Asaas).
 */
export default function DirectPaymentRedirect({ isOpen, onClose, product, directUrl }) {
  const paymentUrl = directUrl || product?.payment_link_url;

  useEffect(() => {
    if (isOpen && paymentUrl) {
      window.open(paymentUrl, '_blank', 'noopener,noreferrer');
      if (onClose) onClose();
    }
  }, [isOpen, paymentUrl, onClose]);

  return null;
}
