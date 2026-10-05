import { useEffect, useRef } from 'react'

/**
 * Uses the native <dialog> element: it gives us focus trapping, Escape to
 * close and a backdrop for free. Prefer platform features over custom code.
 */
export default function Modal({ open, onClose, title, children, size = 'max-w-2xl' }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className={`modal-box w-full ${size}`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button className="btn btn-ghost btn-sm btn-square" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {open && children}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Close">close</button>
      </form>
    </dialog>
  )
}
