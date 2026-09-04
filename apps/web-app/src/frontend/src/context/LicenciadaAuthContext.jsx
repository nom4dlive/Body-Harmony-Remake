import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'
import { v4 as uuidv4 } from 'uuid'

const LicenciadaAuthContext = createContext()

export function LicenciadaAuthProvider({ children }) {
  const [licenciada, setLicenciada] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initSession = async () => {
      setLoading(true)
      const storedLicenciada = localStorage.getItem('bh_licenciada') || localStorage.getItem('bh_student')
      let deviceToken = localStorage.getItem('bh_device_token')

      if (!deviceToken) {
        deviceToken = uuidv4()
        localStorage.setItem('bh_device_token', deviceToken)
      }

      if (storedLicenciada) {
        try {
          const validation = await api.licenciadaValidateSession();
          if (validation && validation.success) {
            const userData = validation.licenciada || validation.student;
            if (userData) {
              const freshData = { ...userData, forceChange: !!userData.force_password_change };
              setLicenciada(freshData)
              localStorage.setItem('bh_licenciada', JSON.stringify(freshData))
            } else {
              console.error("[LicenciadaAuth] Validation data missing user profile:", validation);
              throw { status: 401, message: "Invalid Session Data" };
            }
          } else {
            console.error("[LicenciadaAuth] Validation failed or payload invalid:", validation);
            throw { status: 401, message: "Invalid Session Data" };
          }
        } catch (err) {
          console.warn("[LicenciadaAuth] Session validation failed:", err);
          if (err?.status === 401) {
            console.warn("[LicenciadaAuth] Unauthorized. Clearing session.");
            logout();
          } else {
            console.info("[LicenciadaAuth] Transient error. Preserving local session state.");
            const parsed = JSON.parse(storedLicenciada);
            setLicenciada(parsed);
          }
        }
      }

      setLoading(false)
    }

    initSession();

    const handleUnauthorized = () => {
      console.warn("[LicenciadaAuth] Received 401. Logging out.");
      logout()
    }
    window.addEventListener('licenciada_auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('licenciada_auth:unauthorized', handleUnauthorized)
  }, [])

  const login = async (loginValue, password) => {
    try {
      const deviceToken = localStorage.getItem('bh_device_token')

      const response = await api.licenciadaLogin({
        login: loginValue,
        password,
        device_token: deviceToken
      })

      if (response.success) {
        const licenciadaData = { ...response.licenciada, forceChange: response.forceChange }

        setLicenciada(licenciadaData)
        localStorage.setItem('bh_licenciada', JSON.stringify(licenciadaData))

        if (response.token) {
          localStorage.setItem('bh_licenciada_auth', JSON.stringify({
            token: response.token,
            device_token: response.device_token
          }))
        }

        if (response.device_token) {
          localStorage.setItem('bh_device_token', response.device_token)
        }
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

  const updateLicenciada = (newData) => {
    setLicenciada(prev => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('bh_licenciada', JSON.stringify(updated));
      return updated;
    });
  }

  const logout = () => {
    console.log("[LicenciadaAuth] Clearing session data...");
    setLicenciada(null)
    localStorage.removeItem('bh_licenciada')
    localStorage.removeItem('bh_student')
    localStorage.removeItem('bh_licenciada_auth')
  }

  return (
    <LicenciadaAuthContext.Provider value={{ licenciada, student: licenciada, login, logout, updateLicenciada, updateStudent: updateLicenciada, loading }}>
      {children}
    </LicenciadaAuthContext.Provider>
  )
}

export const useLicenciadaAuth = () => {
  const context = useContext(LicenciadaAuthContext)
  if (!context) {
    throw new Error('useLicenciadaAuth must be used within a LicenciadaAuthProvider')
  }
  return context
}

// Retro-compatibility export (can be removed later)
export const useStudentAuth = useLicenciadaAuth;
export const StudentAuthProvider = LicenciadaAuthProvider;
