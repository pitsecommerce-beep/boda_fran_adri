import * as XLSX from 'xlsx'

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
