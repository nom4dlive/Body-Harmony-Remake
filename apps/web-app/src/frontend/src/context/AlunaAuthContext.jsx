import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AlunaAuthContext = createContext()

// Chave localStorage exclusiva — não conflita com licenciadas
const ALUNA_TOKEN_KEY = 'bh_aluna_token'
const ALUNA_DATA_KEY = 'bh_aluna'

export function AlunaAuthProvider({ children }) {
  const [aluna, setAluna] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initSession = async () => {
      setLoading(true)
      const storedAluna = localStorage.getItem(ALUNA_DATA_KEY)
      const token = localStorage.getItem(ALUNA_TOKEN_KEY)

      if (storedAluna && token) {
        try {
          const validation = await api.aluna.validate()
          if (validation?.success && validation?.aluna) {
            const fresh = { ...validation.aluna, forceChange: !!validation.aluna.force_password_change }
            setAluna(fresh)
            localStorage.setItem(ALUNA_DATA_KEY, JSON.stringify(fresh))
          } else {
            logout()
          }
        } catch (err) {
          if (err?.status === 401 || err?.status === 403) {
            logout()
          } else {
            // Erro transitório — preserva sessão local
            setAluna(JSON.parse(storedAluna))
          }
        }
      }
      setLoading(false)
    }
    initSession()
  }, [])

  const login = async (loginValue, password) => {
    try {
      const currentToken = localStorage.getItem(ALUNA_TOKEN_KEY)
      const response = await api.aluna.login({
        login: loginValue,
        password,
        device_token: currentToken || undefined
      })

      if (response?.success) {
        const alunaData = { ...response.aluna, forceChange: !!response.forceChange }
        setAluna(alunaData)
        localStorage.setItem(ALUNA_DATA_KEY, JSON.stringify(alunaData))
        localStorage.setItem(ALUNA_TOKEN_KEY, response.token)
        return { success: true, forceChange: response.forceChange }
      }
      return { success: false, error: 'Erro desconhecido' }
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.error || error.message || 'Falha ao entrar'
      return {
        success: false,
        error: msg,
        code: error.response?.data?.code || null,
        status: error.status || error.response?.status
      }
    }
  }

  const logout = () => {
    setAluna(null)
    localStorage.removeItem(ALUNA_DATA_KEY)
    localStorage.removeItem(ALUNA_TOKEN_KEY)
  }

  const clearForceChange = () => {
    setAluna(prev => {
      if (!prev) return prev
      const updated = { ...prev, forceChange: false }
      localStorage.setItem(ALUNA_DATA_KEY, JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AlunaAuthContext.Provider value={{ aluna, login, logout, loading, clearForceChange }}>
      {children}
    </AlunaAuthContext.Provider>
  )
}

export const useAlunaAuth = () => {
  const ctx = useContext(AlunaAuthContext)
  if (!ctx) throw new Error('useAlunaAuth must be used within AlunaAuthProvider')
  return ctx
}
