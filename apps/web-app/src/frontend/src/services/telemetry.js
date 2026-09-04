/**
 * Telemetry Service — Google Tag Manager & Meta Pixel DataLayer Hub
 * Nexus Protocol V3.2 Compliant
 * 
 * Centraliza eventos de tráfego (PageView, BeginCheckout, Purchase)
 * enviando para window.dataLayer (GTM) e espelhando defensivamente em window.fbq (Meta Pixel).
 */

export const pushToDataLayer = (payload) => {
  try {
    if (typeof window === 'undefined') return
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(payload)
  } catch (err) {
    console.warn('[Telemetry] Erro ao enviar para dataLayer:', err)
  }
}

const notifyTelemetryListeners = (type, detail) => {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('bh_telemetry_event', {
        detail: {
          type,
          detail,
          timestamp: new Date().toLocaleTimeString('pt-BR')
        }
      }))
    } catch (_) {}
  }
}

/**
 * Rastreia visualização de página (PageView)
 */
export const trackPageView = (path, title = '') => {
  const currentTitle = title || (typeof document !== 'undefined' ? document.title : '')
  const payload = {
    event: 'page_view',
    page_path: path,
    page_title: currentTitle,
    timestamp: new Date().toISOString()
  }
  pushToDataLayer(payload)

  // Fallback direto para Meta Pixel se já estiver instanciado
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', 'PageView')
    } catch (_) {}
  }

  notifyTelemetryListeners('PageView', { path, title: currentTitle })
}

/**
 * Rastreia início de checkout (InitiateCheckout / begin_checkout)
 */
export const trackBeginCheckout = ({ tierName, valueCents, tierId }) => {
  const value = Number(((valueCents || 0) / 100).toFixed(2))

  pushToDataLayer({
    event: 'begin_checkout',
    ecommerce: {
      currency: 'BRL',
      value: value,
      items: [
        {
          item_id: String(tierId || 'ticket'),
          item_name: tierName || 'Ingresso Congresso',
          price: value,
          quantity: 1
        }
      ]
    }
  })

  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', 'InitiateCheckout', {
        content_name: tierName,
        value: value,
        currency: 'BRL'
      })
    } catch (_) {}
  }

  notifyTelemetryListeners('InitiateCheckout', { tierName, value, tierId })
}

/**
 * Rastreia compra finalizada com sucesso (Purchase)
 */
export const trackPurchase = ({ orderId, tierName, valueCents, paymentMethod = 'pix' }) => {
  const value = Number(((valueCents || 0) / 100).toFixed(2))

  pushToDataLayer({
    event: 'purchase',
    ecommerce: {
      transaction_id: String(orderId || `ord_${Date.now()}`),
      value: value,
      currency: 'BRL',
      payment_type: paymentMethod,
      items: [
        {
          item_id: String(orderId || 'ticket'),
          item_name: tierName || 'Ingresso Congresso',
          price: value,
          quantity: 1
        }
      ]
    }
  })

  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', 'Purchase', {
        content_name: tierName,
        value: value,
        currency: 'BRL',
        order_id: String(orderId || '')
      })
    } catch (_) {}
  }

  notifyTelemetryListeners('Purchase', { orderId, tierName, value, paymentMethod })
}
