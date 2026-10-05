import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const notify = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, message, type }])
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 3500)
  }, [])

  const alertClass = { success: 'alert-success', error: 'alert-error', info: 'alert-info' }

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toast toast-end toast-bottom z-[100]" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`alert ${alertClass[t.type]} shadow-lg`}>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const notify = useContext(ToastContext)
  if (!notify) throw new Error('useToast must be used inside <ToastProvider>')
  return notify
}
