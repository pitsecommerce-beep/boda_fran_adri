import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import type { ExcelRow } from '@/types'
import { insertGuests } from '@/lib/supabase'
import { downloadGuestTemplate } from '@/lib/excelTemplate'

interface Props {
  onSuccess: () => void
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
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
        if (!headers.includes('nombre')) {
          setError('Falta la columna "nombre". El archivo debe tener al menos: nombre, celular (opcional), id_familia (opcional).')
          return
        }

        const rows: ExcelRow[] = raw.map((row) => {
          const n: Record<string, unknown> = {}
          for (const [k, v] of Object.entries(row)) {
            n[normalizeHeader(k)] = v
          }
          // Accept both "id_familia" and "familia" as the family identifier
          const familyRaw = n['id_familia'] ?? n['familia']
          return {
            nombre:     String(n['nombre'] ?? '').trim(),
            celular:    n['celular'] ? String(n['celular']).trim() : undefined,
            id_familia: familyRaw ? String(familyRaw).trim() : undefined,
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

    // Map id_familia text → stable UUID (same text = same family group)
    const familyMap = new Map<string, string>()
    const guests = preview.map((r) => {
      let family_id: string | null = null
      if (r.id_familia) {
        if (!familyMap.has(r.id_familia)) {
          familyMap.set(r.id_familia, crypto.randomUUID())
        }
        family_id = familyMap.get(r.id_familia)!
      }
      return {
        name:           r.nombre,
        phone:          r.celular,
        max_companions: 0,
        family_id,
      }
    })

    const { error } = await insertGuests(guests)
    setUploading(false)

    if (error) {
      setError('Error al guardar invitados. Verifica que no haya nombres duplicados.')
    } else {
      setPreview([])
      setFileName(null)
      onSuccess()
    }
  }

  // Unique family groups count for the preview summary
  const familyCount = new Set(preview.map((r) => r.id_familia).filter(Boolean)).size

  return (
    <div>
      {/* Template download hint */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <p className="font-sans text-sm" style={{ color: 'var(--color-muted)' }}>
          Columnas esperadas: <strong>nombre</strong>, celular <em>(opcional)</em>, id_familia <em>(opcional)</em>
        </p>
        <button
          type="button"
          onClick={downloadGuestTemplate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-sans text-xs font-medium transition-all hover:shadow-sm"
          style={{ background: 'var(--color-jade)33', color: 'var(--color-dark)', border: '1px solid var(--color-jade)88' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Descargar plantilla Excel
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all hover:shadow-sm"
        style={{ borderColor: 'var(--color-rose)88', background: 'var(--color-rose)08' }}
      >
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
          Formatos: .xlsx, .xls, .csv
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
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <p className="font-sans text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
                Vista previa — {preview.length} invitado{preview.length !== 1 ? 's' : ''}
                {familyCount > 0 && (
                  <span className="ml-2 text-xs font-normal" style={{ color: 'var(--color-muted)' }}>
                    · {familyCount} grupo{familyCount !== 1 ? 's' : ''} familiar{familyCount !== 1 ? 'es' : ''}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setPreview([]); setFileName(null) }}
                className="px-4 py-2 rounded-xl font-sans text-xs"
                style={{ background: '#f5f5f5', color: 'var(--color-muted)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={uploading}
                className="px-4 py-2 rounded-xl font-sans text-xs font-medium transition-all hover:shadow-sm disabled:opacity-50"
                style={{ background: 'var(--color-jade)', color: 'var(--color-dark)' }}
              >
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
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-dark)' }}>ID Familia</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((row, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--color-rose)22' }}>
                    <td className="px-4 py-2" style={{ color: 'var(--color-dark)' }}>{row.nombre}</td>
                    <td className="px-4 py-2" style={{ color: 'var(--color-muted)' }}>{row.celular || '—'}</td>
                    <td className="px-4 py-2">
                      {row.id_familia
                        ? <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--color-orchid)33', color: 'var(--color-dark)' }}>{row.id_familia}</span>
                        : <span style={{ color: 'var(--color-muted)' }}>—</span>}
                    </td>
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

          {/* Family grouping explanation */}
          {familyCount > 0 && (
            <div className="mt-3 p-3 rounded-xl font-sans text-xs flex gap-2"
              style={{ background: 'var(--color-orchid)22', color: 'var(--color-dark)' }}>
              <span>👨‍👩‍👧</span>
              <span>
                Los invitados con el mismo <strong>id_familia</strong> se agruparán.
                Al confirmar asistencia, podrán elegir quiénes del grupo asisten.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
