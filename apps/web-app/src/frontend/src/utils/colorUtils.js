/**
 * Calcula cor de texto ideal (preto/branco) baseado em luminância
 * Usa cálculo de luminância relativa ITU-R BT.709
 * 
 * @param {string} hexColor - Cor em formato hex (#RRGGBB ou RRGGBB)
 * @returns {string} '#000000' (preto) ou '#FFFFFF' (branco)
 * 
 * @example
 * getContrastColor('#FFFFFF') // retorna '#000000' (texto preto em fundo branco)
 * getContrastColor('#000000') // retorna '#FFFFFF' (texto branco em fundo preto)
 * getContrastColor('#D4AF37') // retorna '#000000' (texto preto em fundo dourado)
 */
export function getContrastColor(hexColor) {
  // Validação: retorna preto para valores vazios/inválidos
  if (!hexColor || hexColor === '') return '#000000'
  
  // Remove # se presente
  const hex = hexColor.replace('#', '')
  
  // Validação: hex code deve ter 6 caracteres
  if (hex.length !== 6) return '#000000'
  
  // Parse RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Validação: RGB devem ser números válidos
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '#000000'
  
  // Calcular luminância relativa (ITU-R BT.709)
  // Pesos: Red=0.299, Green=0.587, Blue=0.114
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Threshold: 0.5 (cores escuras recebem texto branco)
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}
