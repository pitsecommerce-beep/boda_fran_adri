import * as XLSX from 'xlsx'
import type { Guest, RSVP } from '@/types'

/**
 * Generates and triggers download of a guest list template (.xlsx).
 * Columns: nombre, celular, id_familia
 *
 * id_familia: any text identifier (e.g. "garcia", "001") that groups family
 * members. Guests sharing the same id_familia will be shown together when
 * confirming attendance on the invitation page.
 */
export function downloadGuestTemplate() {
  const sampleData = [
    { nombre: 'Ana García',       celular: '5512345678', id_familia: 'garcia', cabeza_familia: 'sí' },
    { nombre: 'Carlos García',    celular: '5512345679', id_familia: 'garcia', cabeza_familia: '' },
    { nombre: 'María García',     celular: '',           id_familia: 'garcia', cabeza_familia: '' },
    { nombre: 'Pedro López',      celular: '5598765432', id_familia: 'lopez',  cabeza_familia: 'sí' },
    { nombre: 'Laura López',      celular: '',           id_familia: 'lopez',  cabeza_familia: '' },
    { nombre: 'Roberto Martínez', celular: '5511223344', id_familia: '',       cabeza_familia: '' },
  ]

  const ws = XLSX.utils.json_to_sheet(sampleData, {
    header: ['nombre', 'celular', 'id_familia', 'cabeza_familia'],
  })

  // Column widths
  ws['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 18 }, { wch: 16 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Invitados')

  XLSX.writeFile(wb, 'plantilla_invitados.xlsx')
}

export function downloadGuestReport(guests: Guest[], rsvps: RSVP[]) {
  const rows = guests.map((g) => {
    const rsvp = rsvps.find((r) => r.guest_id === g.id) ?? null
    return {
      nombre: g.name,
      celular: g.phone ?? '',
      acompanantes_max: g.max_companions,
      asistencia: rsvp ? (rsvp.attending ? 'Confirmado' : 'No asistirá') : 'Sin respuesta',
      acompanantes_confirmados: rsvp?.attending ? rsvp.companion_count : '',
      restricciones_alimenticias: rsvp?.dietary_notes ?? '',
      necesita_hospedaje: rsvp?.attending && rsvp.needs_accommodation ? 'Sí' : '',
      mensaje: rsvp?.message ?? '',
    }
  })

  const ws = XLSX.utils.json_to_sheet(rows, {
    header: ['nombre', 'celular', 'acompanantes_max', 'asistencia', 'acompanantes_confirmados', 'restricciones_alimenticias', 'necesita_hospedaje', 'mensaje'],
  })

  ws['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 22 }, { wch: 30 }, { wch: 18 }, { wch: 40 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Invitados')

  const date = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `reporte_invitados_${date}.xlsx`)
}
