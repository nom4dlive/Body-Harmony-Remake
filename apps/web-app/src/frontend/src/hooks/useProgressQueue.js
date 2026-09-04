/**
 * useProgressQueue — V95 (LMS Mobile Resilience)
 * Fila local de progresso de aulas para conexões 3G/4G instáveis.
 *
 * Estratégia:
 *  1. Ao salvar, tenta a API diretamente.
 *  2. Se falhar, enfileira no localStorage com TTL de 7 dias.
 *  3. No mount de qualquer componente que use este hook, tenta
 *     reenviar todos os itens pendentes da fila.
 *
 * Zero regressão: Se a API funciona, o fluxo é idêntico ao original.
 */
import { useCallback, useEffect, useRef } from 'react'
import { api } from '../services/api'

const QUEUE_KEY = 'bh_progress_queue'
const QUEUE_TTL_DAYS = 7
const MS_PER_DAY = 86400000

// ── Helpers de queue ──────────────────────────────────────────────────────────

function getQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    if (!raw) return []
    const items = JSON.parse(raw)
    const cutoff = Date.now() - QUEUE_TTL_DAYS * MS_PER_DAY
    return items.filter(i => i.timestamp > cutoff)
  } catch {
    return []
  }
}

function saveQueue(items) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items))
  } catch { /* quota exceeded — silencioso */ }
}

function addToQueue(item) {
  const queue = getQueue()
  // Substitui se já existir entrada para o mesmo lesson_id
  const idx = queue.findIndex(i => i.lesson_id === item.lesson_id)
  if (idx !== -1) {
    queue[idx] = item
  } else {
    queue.push(item)
  }
  saveQueue(queue)
}

function removeFromQueue(lessonId) {
  const queue = getQueue().filter(i => i.lesson_id !== lessonId)
  saveQueue(queue)
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * @param {number|string} lessonId  ID da aula atual (para flush seletivo)
 * @returns {{ saveProgress, syncStatus }}
 *
 * syncStatus: 'idle' | 'saving' | 'saved' | 'queued' | 'offline'
 */
export function useProgressQueue(lessonId) {
  const syncStatusRef = useRef('idle')
  const setSyncStatus = useCallback((status) => {
    syncStatusRef.current = status
    // Dispara evento para componente renderizar indicador visual
    window.dispatchEvent(new CustomEvent('bh:progressSync', { detail: { lessonId, status } }))
  }, [lessonId])

  // Flush de itens pendentes ao montar (ex.: aluna volta depois de ficar offline)
  useEffect(() => {
    const pending = getQueue()
    if (pending.length === 0) return

    let cancelled = false
    const flush = async () => {
      for (const item of pending) {
        if (cancelled) break
        try {
          await api.aluna.updateProgress({
            lesson_id: item.lesson_id,
            progress_percent: item.progress_percent,
            is_completed: item.is_completed
          })
          removeFromQueue(item.lesson_id)
        } catch {
          // Mantém na fila para próxima tentativa
        }
      }
    }
    flush()
    return () => { cancelled = true }
  }, []) // Roda apenas no mount

  /**
   * Tenta salvar o progresso. Se falhar, enfileira.
   */
  const saveProgress = useCallback(async (progressPercent, isCompleted = false) => {
    setSyncStatus('saving')
    const payload = {
      lesson_id: parseInt(lessonId, 10),
      progress_percent: progressPercent,
      is_completed: isCompleted ? 1 : 0
    }

    try {
      await api.aluna.updateProgress(payload)
      removeFromQueue(payload.lesson_id)
      setSyncStatus('saved')
    } catch {
      addToQueue({ ...payload, timestamp: Date.now() })
      setSyncStatus('queued')
    }
  }, [lessonId, setSyncStatus])

  return { saveProgress }
}
