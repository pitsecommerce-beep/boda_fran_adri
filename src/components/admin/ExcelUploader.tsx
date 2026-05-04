import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import type { ExcelRow } from '@/types'
import { insertGuests } from '@/lib/supabase'

interface Props {
  onSuccess: () => void
}

const REQUIRED_COLS = ['nombre']

function normalizeHeader(h: string): string {
  return h.toLowerCase().trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove accents
    .replace(/\s+/g, '_')
}

export default function ExcelUploader({ onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<ExcelRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFile = (file: File) => {
    setError(null)
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        if (!raw.length) { setError('El archivo está vacío.'); return }

        // Normalize headers
        const firstRow = raw[0]
        const headers = Object.keys(firstRow).map(normalizeHeader)
        const missing = REQUIRED_COLS.filter((c) => !headers.includes(c))
        if (missing.length) {
          setError(`Faltan columnas requeridas: ${missing.join(', ')}. Las columnas deben llamarse: nombre, celular (opcional), acompanantes (opcional).`)
          return
        }

        const rows: ExcelRow[] = raw.map((row) => {
          const normalized: Record<string, unknown> = {}
          for (const [k, v] of Object.entries(row)) {
            normalized[normalizeHeader(k)] = v
          }
          return {
            nombre: String(normalized['nombre'] ?? '').trim(),
            celular: normalized['celular'] ? String(normalized['celular']).trim() : undefined,
            acompanantes: normalized['acompanantes'] ? Number(normalized['acompanantes']) : 0,
          }
        }).filter((r) => r.nombre)

        setPreview(rows)
      } catch {
        setError('No se pudo leer el archivo. Asegúrate de que sea un Excel (.xlsx) o CSV válido.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleImport = async () => {
    if (!preview.length) return
    setUploading(true)

    const guests = preview.map((r) => ({
      name: r.nombre,
      phone: r.celular,
      max_companions: r.acompanantes ?? 0,
    }))

    const { error } = await insertGuests(guests)
    setUploading(false)

    if (error) {
      setError('Error al guardar invitados. Revisa si hay nombres duplicados.')
    } else {
      setPreview([])
      setFileName(null)
      onSuccess()
    }
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all hover:shadow-sm"
        style={{ borderColor: 'var(--color-rose)88', background: 'var(--color-rose)08' }}>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        <div className="text-4xl mb-3">📊</div>
        <p className="font-serif text-lg" style={{ color: 'var(--color-dark)' }}>
          {fileName ?? 'Arrastra tu Excel aquí o haz clic para seleccionar'}
        </p>
        <p className="mt-1 font-sans text-sm" style={{ color: 'var(--color-muted)' }}>
          Formatos: .xlsx, .xls, .csv — Columnas: <strong>nombre</strong>, celular, acompanantes
        </p>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-sans">
          {error}
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-sans text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
              Vista previa — {preview.length} invitado{preview.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setPreview([]); setFileName(null) }}
                className="px-4 py-2 rounded-xl font-sans text-xs"
                style={{ background: '#f5f5f5', color: 'var(--color-muted)' }}>
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={uploading}
                className="px-4 py-2 rounded-xl font-sans text-xs font-medium transition-all hover:shadow-sm disabled:opacity-50"
                style={{ background: 'var(--color-jade)', color: 'var(--color-dark)' }}>
                {uploading ? 'Importando…' : `Importar ${preview.length} invitados`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--color-rose)33' }}>
            <table className="w-full text-sm font-sans">
              <thead>
                <tr style={{ background: 'var(--color-rose)22' }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-dark)' }}>Nombre</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-dark)' }}>Celular</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-dark)' }}>Acompañantes</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((row, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--color-rose)22' }}>
                    <td className="px-4 py-2" style={{ color: 'var(--color-dark)' }}>{row.nombre}</td>
                    <td className="px-4 py-2" style={{ color: 'var(--color-muted)' }}>{row.celular ?? '—'}</td>
                    <td className="px-4 py-2" style={{ color: 'var(--color-muted)' }}>{row.acompanantes ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 10 && (
              <p className="px-4 py-2 text-xs text-center" style={{ color: 'var(--color-muted)' }}>
                … y {preview.length - 10} más
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
