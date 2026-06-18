import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import type { Guest, GuestGroup, SeatingTable, SeatAssignment } from '@/types'
import {
  listGuests,
  listGuestGroups,
  createGuestGroup,
  updateGuestGroup,
  deleteGuestGroup,
  listSeatingTables,
  createSeatingTable,
  updateSeatingTable,
  deleteSeatingTable,
  listSeatAssignments,
  assignGuestToTable,
  removeGuestFromTable,
  updateGuest,
} from '@/lib/supabase'

const GROUP_COLORS = [
  '#B8966E', '#7A9E82', '#6B2437', '#4A90D9', '#D4A96A',
  '#9B59B6', '#E67E22', '#1ABC9C', '#E74C3C', '#3498DB',
  '#2ECC71', '#F39C12', '#8E44AD', '#16A085', '#C0392B',
]

const TABLE_DEFAULTS: Record<string, { width: number; height: number; capacity: number }> = {
  circle: { width: 120, height: 120, capacity: 8 },
  square: { width: 110, height: 110, capacity: 8 },
  rectangle: { width: 180, height: 100, capacity: 10 },
}

const CANVAS_W = 2400
const CANVAS_H = 1600

export default function AdminSeatingPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [groups, setGroups] = useState<GuestGroup[]>([])
  const [tables, setTables] = useState<SeatingTable[]>([])
  const [assignments, setAssignments] = useState<SeatAssignment[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [filterGroup, setFilterGroup] = useState<string>('all')
  const [filterSeat, setFilterSeat] = useState<'all' | 'seated' | 'unseated'>('all')
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [draggingGuest, setDraggingGuest] = useState<string | null>(null)
  const [draggingTable, setDraggingTable] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const [showGroupModal, setShowGroupModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<GuestGroup | null>(null)
  const [groupName, setGroupName] = useState('')
  const [groupColor, setGroupColor] = useState(GROUP_COLORS[0])

  const [showTableModal, setShowTableModal] = useState(false)
  const [editingTable, setEditingTable] = useState<SeatingTable | null>(null)
  const [tableName, setTableName] = useState('')
  const [tableShape, setTableShape] = useState<'circle' | 'square' | 'rectangle'>('circle')
  const [tableCapacity, setTableCapacity] = useState(8)

  const [tab, setTab] = useState<'plan' | 'groups'>('plan')
  const [zoom, setZoom] = useState(0.65)

  const viewportRef = useRef<HTMLDivElement>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [g, gr, t, a] = await Promise.all([
      listGuests(), listGuestGroups(), listSeatingTables(), listSeatAssignments(),
    ])
    setGuests(g)
    setGroups(gr)
    setTables(t)
    setAssignments(a)
    setLoading(false)
  }, [])

  useEffect(() => { void loadData() }, [loadData])

  const assignmentsByTable = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const a of assignments) {
      if (!map[a.table_id]) map[a.table_id] = []
      map[a.table_id].push(a.guest_id)
    }
    return map
  }, [assignments])

  const assignedGuestIds = useMemo(() => new Set(assignments.map(a => a.guest_id)), [assignments])

  const guestMap = useMemo(() => {
    const m: Record<string, Guest> = {}
    for (const g of guests) m[g.id] = g
    return m
  }, [guests])

  const groupMap = useMemo(() => {
    const m: Record<string, GuestGroup> = {}
    for (const g of groups) m[g.id] = g
    return m
  }, [groups])

  const filteredGuests = useMemo(() => {
    let list = guests
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(g => g.name.toLowerCase().includes(q))
    }
    if (filterGroup !== 'all') {
      if (filterGroup === 'none') list = list.filter(g => !g.group_id)
      else list = list.filter(g => g.group_id === filterGroup)
    }
    if (filterSeat === 'seated') list = list.filter(g => assignedGuestIds.has(g.id))
    if (filterSeat === 'unseated') list = list.filter(g => !assignedGuestIds.has(g.id))
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [guests, search, filterGroup, filterSeat, assignedGuestIds])

  // ── Convert mouse event to canvas coordinates ─────────────────────
  const toCanvas = (e: React.MouseEvent): { x: number; y: number } | null => {
    const vp = viewportRef.current
    if (!vp) return null
    const rect = vp.getBoundingClientRect()
    const x = (e.clientX - rect.left + vp.scrollLeft) / zoom
    const y = (e.clientY - rect.top + vp.scrollTop) / zoom
    return { x, y }
  }

  // ── Group CRUD ────────────────────────────────────────────────────
  const handleSaveGroup = async () => {
    if (!groupName.trim()) return
    if (editingGroup) {
      await updateGuestGroup(editingGroup.id, { name: groupName.trim(), color: groupColor })
    } else {
      await createGuestGroup({ name: groupName.trim(), color: groupColor })
    }
    setShowGroupModal(false)
    setEditingGroup(null)
    setGroupName('')
    setGroupColor(GROUP_COLORS[0])
    void loadData()
  }

  const handleDeleteGroup = async (id: string) => {
    await deleteGuestGroup(id)
    void loadData()
  }

  const handleAssignGroup = async (guestId: string, groupId: string | null) => {
    await updateGuest(guestId, { group_id: groupId })
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, group_id: groupId } : g))
  }

  // ── Table CRUD ────────────────────────────────────────────────────
  const handleSaveTable = async () => {
    if (!tableName.trim()) return
    if (editingTable) {
      await updateSeatingTable(editingTable.id, {
        name: tableName.trim(), shape: tableShape, capacity: tableCapacity,
      })
    } else {
      const defaults = TABLE_DEFAULTS[tableShape]
      const vp = viewportRef.current
      const scrollX = vp ? vp.scrollLeft / zoom : 0
      const scrollY = vp ? vp.scrollTop / zoom : 0
      await createSeatingTable({
        name: tableName.trim(),
        shape: tableShape,
        capacity: tableCapacity,
        x: scrollX + 200 + Math.random() * 200,
        y: scrollY + 150 + Math.random() * 200,
        width: defaults.width,
        height: defaults.height,
        rotation: 0,
      })
    }
    setShowTableModal(false)
    setEditingTable(null)
    setTableName('')
    setTableShape('circle')
    setTableCapacity(8)
    void loadData()
  }

  const handleDeleteTable = async (id: string) => {
    await deleteSeatingTable(id)
    if (selectedTable === id) setSelectedTable(null)
    void loadData()
  }

  // ── Table drag ────────────────────────────────────────────────────
  const handleTableMouseDown = (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation()
    e.preventDefault()
    const table = tables.find(t => t.id === tableId)
    if (!table) return
    const pt = toCanvas(e)
    if (!pt) return
    setDraggingTable(tableId)
    setDragOffset({ x: pt.x - table.x, y: pt.y - table.y })
    setSelectedTable(tableId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingTable) return
    const pt = toCanvas(e)
    if (!pt) return
    const newX = Math.max(0, Math.min(CANVAS_W - 60, pt.x - dragOffset.x))
    const newY = Math.max(0, Math.min(CANVAS_H - 60, pt.y - dragOffset.y))
    setTables(prev => prev.map(t => t.id === draggingTable ? { ...t, x: newX, y: newY } : t))
  }

  const handleMouseUp = async () => {
    if (draggingTable) {
      const table = tables.find(t => t.id === draggingTable)
      if (table) await updateSeatingTable(draggingTable, { x: table.x, y: table.y })
      setDraggingTable(null)
    }
  }

  // ── Guest drag & drop onto tables ─────────────────────────────────
  const handleGuestDragStart = (e: React.DragEvent, guestId: string) => {
    setDraggingGuest(guestId)
    e.dataTransfer.setData('text/plain', guestId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleTableDrop = async (e: React.DragEvent, tableId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const guestId = e.dataTransfer.getData('text/plain') || draggingGuest
    if (!guestId) return
    const tableGuests = assignmentsByTable[tableId] ?? []
    const table = tables.find(t => t.id === tableId)
    if (table && tableGuests.length >= table.capacity) return
    await assignGuestToTable(guestId, tableId)
    setDraggingGuest(null)
    void loadData()
  }

  const handleRemoveFromTable = async (guestId: string) => {
    await removeGuestFromTable(guestId)
    void loadData()
  }

  // ── Zoom via wheel ────────────────────────────────────────────────
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      setZoom(z => Math.min(1.5, Math.max(0.25, z - e.deltaY * 0.001)))
    }
  }, [])

  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return
    vp.addEventListener('wheel', handleWheel, { passive: false })
    return () => vp.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const getFirstName = (n: string) => n.split(' ')[0]

  // ── Render ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <AdminLayout title="Plano de Mesas">
        <div className="text-center py-16 font-serif italic" style={{ color: 'var(--color-muted)' }}>
          Cargando...
        </div>
      </AdminLayout>
    )
  }

  const unseatedCount = guests.filter(g => !assignedGuestIds.has(g.id)).length
  const selectedTableObj = tables.find(t => t.id === selectedTable)
  const selectedTableGuests = selectedTable ? (assignmentsByTable[selectedTable] ?? []) : []

  const renderTable = (table: SeatingTable) => {
    const tGuests = assignmentsByTable[table.id] ?? []
    const isFull = tGuests.length >= table.capacity
    const isSel = selectedTable === table.id
    const fill = isSel ? 'var(--color-yellow)' : isFull ? '#ddd5c8' : 'white'
    const stroke = isSel ? 'var(--color-dark)' : 'var(--color-gold-light)'
    const radius = table.shape === 'circle' ? '50%' : table.shape === 'square' ? '12px' : '16px'

    const cx = table.x + table.width / 2
    const cy = table.y + table.height / 2
    const seatR = 13
    const gap = 20
    const orx = table.width / 2 + gap
    const ory = table.height / 2 + gap

    return (
      <div key={table.id}>
        {/* Seats */}
        {Array.from({ length: table.capacity }).map((_, i) => {
          const angle = (2 * Math.PI * i) / table.capacity - Math.PI / 2
          const sx = cx + orx * Math.cos(angle)
          const sy = cy + ory * Math.sin(angle)
          const guest = tGuests[i] ? guestMap[tGuests[i]] : null
          const grp = guest?.group_id ? groupMap[guest.group_id] : null
          const firstName = guest ? getFirstName(guest.name) : null

          const labelR = seatR + 12
          const lx = cx + (orx + labelR) * Math.cos(angle)
          const ly = cy + (ory + labelR) * Math.sin(angle)

          return (
            <div key={`seat-${table.id}-${i}`}>
              <div
                title={guest?.name ?? 'Libre'}
                style={{
                  position: 'absolute', left: sx - seatR, top: sy - seatR,
                  width: seatR * 2, height: seatR * 2, borderRadius: '50%',
                  background: guest ? (grp?.color ?? 'var(--color-gold)') : 'var(--color-khaki)',
                  border: guest ? '2px solid white' : '1px dashed var(--color-gold-light)',
                  boxShadow: guest ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {guest && (
                  <span style={{ color: 'white', fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-sans)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                    {firstName!.charAt(0)}
                  </span>
                )}
              </div>
              {guest && (
                <span style={{
                  position: 'absolute', left: lx, top: ly,
                  transform: 'translate(-50%,-50%)',
                  fontSize: 10, fontFamily: 'var(--font-sans)', fontWeight: 500,
                  color: 'var(--color-dark)', whiteSpace: 'nowrap', pointerEvents: 'none',
                }}>
                  {firstName}
                </span>
              )}
            </div>
          )
        })}

        {/* Table body */}
        <div
          style={{
            position: 'absolute', left: table.x, top: table.y,
            width: table.width, height: table.height,
            background: fill, border: `2px solid ${stroke}`, borderRadius: radius,
            cursor: draggingTable === table.id ? 'grabbing' : 'grab',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: isSel ? '0 4px 20px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.08)',
            transition: draggingTable === table.id ? 'none' : 'box-shadow 0.2s',
            zIndex: isSel ? 10 : 1, userSelect: 'none',
          }}
          onMouseDown={e => handleTableMouseDown(e, table.id)}
          onClick={e => { e.stopPropagation(); setSelectedTable(table.id) }}
          onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
          onDrop={e => void handleTableDrop(e, table.id)}
        >
          <span className="font-sans font-semibold" style={{ fontSize: 11, color: 'var(--color-dark)', lineHeight: 1.1, textAlign: 'center' }}>
            {table.name}
          </span>
          <span className="font-sans" style={{ fontSize: 10, color: 'var(--color-muted)' }}>
            {tGuests.length}/{table.capacity}
          </span>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout title="Plano de Mesas">
      {/* Stats bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { label: 'Mesas', value: tables.length, bg: 'white', color: 'var(--color-dark)' },
          { label: 'Sentados', value: `${assignments.length}/${guests.length}`, bg: 'white', color: 'var(--color-dark)' },
          { label: 'Sin mesa', value: unseatedCount, bg: unseatedCount > 0 ? '#FEF3CD' : '#D4EDDA', color: unseatedCount > 0 ? '#856404' : '#155724' },
          { label: 'Grupos', value: groups.length, bg: 'white', color: 'var(--color-dark)' },
        ].map(s => (
          <div key={s.label} className="px-3 py-1.5 rounded-lg font-sans text-xs" style={{ background: s.bg, border: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-muted)' }}>{s.label}: </span>
            <strong style={{ color: s.color }}>{s.value}</strong>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: 'var(--color-khaki)' }}>
        {(['plan', 'groups'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg font-sans text-sm transition-all"
            style={{
              background: tab === t ? 'white' : 'transparent',
              color: 'var(--color-dark)', fontWeight: tab === t ? 600 : 400,
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>
            {t === 'plan' ? 'Plano de Mesas' : 'Grupos de Invitados'}
          </button>
        ))}
      </div>

      {tab === 'plan' && (
        <div className="flex flex-col lg:flex-row gap-4" style={{ height: 'calc(100vh - 260px)', minHeight: 480 }}>
          {/* Left: canvas area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Toolbar */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <button
                onClick={() => { setEditingTable(null); setTableName(''); setTableShape('circle'); setTableCapacity(8); setShowTableModal(true) }}
                className="px-3 py-1.5 rounded-lg font-sans text-xs font-medium"
                style={{ background: 'var(--color-dark)', color: 'white' }}
              >
                + Mesa
              </button>
              {selectedTableObj && (
                <>
                  <button onClick={() => {
                    setEditingTable(selectedTableObj); setTableName(selectedTableObj.name)
                    setTableShape(selectedTableObj.shape); setTableCapacity(selectedTableObj.capacity)
                    setShowTableModal(true)
                  }}
                    className="px-2 py-1.5 rounded-lg font-sans text-xs"
                    style={{ background: 'var(--color-yellow)22', color: 'var(--color-dark)', border: '1px solid var(--color-border)' }}>
                    Editar
                  </button>
                  <button onClick={() => void handleDeleteTable(selectedTableObj.id)}
                    className="px-2 py-1.5 rounded-lg font-sans text-xs"
                    style={{ background: '#E0555522', color: '#E05555', border: '1px solid #E0555533' }}>
                    Eliminar
                  </button>
                </>
              )}
              <div className="flex-1" />
              {/* Zoom */}
              <div className="flex items-center gap-1.5">
                <button onClick={() => setZoom(z => Math.max(0.25, +(z - 0.1).toFixed(2)))}
                  className="w-7 h-7 rounded font-sans text-xs font-bold flex items-center justify-center"
                  style={{ background: 'white', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }}>-</button>
                <span className="font-sans text-xs w-10 text-center" style={{ color: 'var(--color-muted)' }}>
                  {Math.round(zoom * 100)}%
                </span>
                <button onClick={() => setZoom(z => Math.min(1.5, +(z + 0.1).toFixed(2)))}
                  className="w-7 h-7 rounded font-sans text-xs font-bold flex items-center justify-center"
                  style={{ background: 'white', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }}>+</button>
                <button onClick={() => setZoom(0.65)}
                  className="px-1.5 h-7 rounded font-sans text-xs flex items-center justify-center"
                  style={{ background: 'white', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
                  Ajustar
                </button>
              </div>
            </div>

            {/* Viewport: fixed-size scrollable container */}
            <div
              ref={viewportRef}
              onMouseMove={handleMouseMove}
              onMouseUp={() => void handleMouseUp()}
              onMouseLeave={() => void handleMouseUp()}
              onDragOver={e => e.preventDefault()}
              className="flex-1 rounded-xl overflow-auto relative"
              style={{
                border: '2px solid var(--color-border)',
                background: '#eee9e0',
                cursor: draggingTable ? 'grabbing' : 'default',
              }}
            >
              {/* Sizer: this div has the zoomed dimensions so scrollbars work correctly */}
              <div style={{ width: CANVAS_W * zoom, height: CANVAS_H * zoom, position: 'relative' }}>
                {/* Canvas: positioned at origin, scaled via transform */}
                <div
                  onClick={() => setSelectedTable(null)}
                  style={{
                    position: 'absolute', top: 0, left: 0,
                    width: CANVAS_W, height: CANVAS_H,
                    transform: `scale(${zoom})`, transformOrigin: '0 0',
                    background: 'white',
                    backgroundImage: 'radial-gradient(circle, rgba(184,150,110,0.2) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }}
                >
                  {tables.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="font-serif text-xl mb-2" style={{ color: 'var(--color-muted)' }}>
                        No hay mesas todavia
                      </p>
                      <p className="font-sans text-sm" style={{ color: 'var(--color-muted)' }}>
                        Haz clic en "+ Mesa" para empezar
                      </p>
                    </div>
                  ) : tables.map(renderTable)}
                </div>
              </div>
            </div>

            {/* Hint */}
            <p className="font-sans text-xs mt-1.5" style={{ color: 'var(--color-muted)' }}>
              Arrastra mesas para moverlas &middot; Ctrl+scroll para zoom &middot; Arrastra invitados de la lista a una mesa
            </p>
          </div>

          {/* Right: sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-3" style={{ maxHeight: 'calc(100vh - 260px)' }}>
            {/* Selected table detail */}
            {selectedTableObj && (
              <div className="rounded-xl p-3 flex-shrink-0" style={{ background: 'white', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-sans text-sm font-semibold" style={{ color: 'var(--color-dark)' }}>
                    {selectedTableObj.name}
                  </h3>
                  <span className="font-sans text-xs" style={{
                    color: selectedTableGuests.length >= selectedTableObj.capacity ? '#E05555' : 'var(--color-muted)',
                  }}>
                    {selectedTableGuests.length}/{selectedTableObj.capacity}
                  </span>
                </div>
                {selectedTableGuests.length === 0 ? (
                  <p className="font-sans text-xs italic" style={{ color: 'var(--color-muted)' }}>
                    Arrastra invitados aqui.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedTableGuests.map(gId => {
                      const guest = guestMap[gId]
                      if (!guest) return null
                      const grp = guest.group_id ? groupMap[guest.group_id] : null
                      return (
                        <span key={gId} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans text-xs"
                          style={{ background: grp ? `${grp.color}22` : 'var(--color-khaki)', border: `1px solid ${grp?.color ?? 'var(--color-border)'}` }}>
                          {grp && <span style={{ width: 6, height: 6, borderRadius: '50%', background: grp.color }} />}
                          {guest.name}
                          <button onClick={() => void handleRemoveFromTable(gId)} className="opacity-40 hover:opacity-100 ml-0.5" style={{ lineHeight: 1 }}>x</button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Guest list */}
            <div className="rounded-xl p-3 flex-1 flex flex-col min-h-0" style={{ background: 'white', border: '1px solid var(--color-border)' }}>
              <h3 className="font-sans text-sm font-semibold mb-2" style={{ color: 'var(--color-dark)' }}>Invitados</h3>
              <input
                type="text" placeholder="Buscar..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg font-sans text-xs mb-2"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }}
              />
              <div className="flex gap-1.5 mb-2">
                <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
                  className="flex-1 px-1.5 py-1 rounded font-sans text-xs min-w-0"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }}>
                  <option value="all">Todos los grupos</option>
                  <option value="none">Sin grupo</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <select value={filterSeat} onChange={e => setFilterSeat(e.target.value as 'all' | 'seated' | 'unseated')}
                  className="px-1.5 py-1 rounded font-sans text-xs"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }}>
                  <option value="all">Todos</option>
                  <option value="unseated">Sin mesa</option>
                  <option value="seated">Sentados</option>
                </select>
              </div>
              <p className="font-sans mb-1" style={{ fontSize: 10, color: 'var(--color-muted)' }}>
                {filteredGuests.length} invitado{filteredGuests.length !== 1 ? 's' : ''}
              </p>
              <div className="flex-1 overflow-y-auto space-y-0.5 min-h-0">
                {filteredGuests.map(guest => {
                  const isSeated = assignedGuestIds.has(guest.id)
                  const grp = guest.group_id ? groupMap[guest.group_id] : null
                  return (
                    <div
                      key={guest.id}
                      draggable
                      onDragStart={e => handleGuestDragStart(e, guest.id)}
                      onDragEnd={() => setDraggingGuest(null)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
                      style={{
                        background: isSeated ? 'var(--color-khaki)' : 'var(--color-surface)',
                        border: `1px solid ${grp?.color ?? 'var(--color-border)'}`,
                        opacity: isSeated ? 0.55 : 1,
                      }}
                    >
                      {grp && <span style={{ width: 7, height: 7, borderRadius: '50%', background: grp.color, flexShrink: 0 }} />}
                      <span className="font-sans text-xs flex-1 truncate" style={{ color: 'var(--color-dark)' }}>
                        {guest.name}
                      </span>
                      {isSeated && (
                        <span className="font-sans px-1 py-0.5 rounded" style={{ background: 'var(--color-gold-light)33', color: 'var(--color-muted)', fontSize: 9, flexShrink: 0 }}>
                          {tables.find(t => t.id === assignments.find(a => a.guest_id === guest.id)?.table_id)?.name ?? ''}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'groups' && (
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => { setEditingGroup(null); setGroupName(''); setGroupColor(GROUP_COLORS[groups.length % GROUP_COLORS.length]); setShowGroupModal(true) }}
                className="px-4 py-2 rounded-xl font-sans text-sm font-medium"
                style={{ background: 'var(--color-dark)', color: 'white' }}>
                + Crear grupo
              </button>
            </div>
            {groups.length === 0 ? (
              <div className="text-center py-12 rounded-2xl" style={{ background: 'white', border: '1px solid var(--color-border)' }}>
                <p className="font-serif text-lg mb-2" style={{ color: 'var(--color-muted)' }}>No hay grupos todavia</p>
                <p className="font-sans text-sm" style={{ color: 'var(--color-muted)' }}>
                  Crea grupos como "Amigos universidad", "Familia novia", etc.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.map(group => {
                  const gGuests = guests.filter(g => g.group_id === group.id)
                  return (
                    <div key={group.id} className="rounded-xl p-4" style={{ background: 'white', border: `2px solid ${group.color}33` }}>
                      <div className="flex items-center gap-3 mb-3">
                        <span style={{ width: 14, height: 14, borderRadius: '50%', background: group.color, flexShrink: 0 }} />
                        <h3 className="font-sans text-sm font-semibold flex-1" style={{ color: 'var(--color-dark)' }}>{group.name}</h3>
                        <span className="font-sans text-xs" style={{ color: 'var(--color-muted)' }}>{gGuests.length} invitados</span>
                        <button onClick={() => { setEditingGroup(group); setGroupName(group.name); setGroupColor(group.color); setShowGroupModal(true) }}
                          className="px-2 py-1 rounded-lg font-sans text-xs"
                          style={{ background: 'var(--color-surface)', color: 'var(--color-muted)' }}>Editar</button>
                        <button onClick={() => void handleDeleteGroup(group.id)}
                          className="px-2 py-1 rounded-lg font-sans text-xs" style={{ color: '#E05555' }}>Eliminar</button>
                      </div>
                      {gGuests.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {gGuests.map(g => (
                            <span key={g.id} className="px-2.5 py-1 rounded-full font-sans text-xs"
                              style={{ background: `${group.color}18`, border: `1px solid ${group.color}44`, color: 'var(--color-dark)' }}>
                              {g.name}
                              <button onClick={() => void handleAssignGroup(g.id, null)} className="ml-1.5 opacity-40 hover:opacity-100">x</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid var(--color-border)' }}>
              <h3 className="font-serif text-lg mb-3" style={{ color: 'var(--color-dark)' }}>Asignar a grupo</h3>
              <input type="text" placeholder="Buscar invitado..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg font-sans text-sm mb-3"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }} />
              <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                {(search ? filteredGuests : guests.filter(g => !g.group_id)).slice(0, 50).map(guest => {
                  const grp = guest.group_id ? groupMap[guest.group_id] : null
                  return (
                    <div key={guest.id} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                      {grp && <span style={{ width: 8, height: 8, borderRadius: '50%', background: grp.color, flexShrink: 0 }} />}
                      <span className="font-sans text-xs flex-1 truncate" style={{ color: 'var(--color-dark)' }}>{guest.name}</span>
                      <select value={guest.group_id ?? ''} onChange={e => void handleAssignGroup(guest.id, e.target.value || null)}
                        className="px-1.5 py-1 rounded font-sans text-xs"
                        style={{ background: 'white', border: '1px solid var(--color-border)', color: 'var(--color-dark)', maxWidth: 110 }}>
                        <option value="">Sin grupo</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group modal */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(44,32,18,0.55)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" style={{ border: '1px solid var(--color-border)' }}>
            <h3 className="font-serif text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
              {editingGroup ? 'Editar grupo' : 'Nuevo grupo'}
            </h3>
            <label className="block font-sans text-xs mb-1" style={{ color: 'var(--color-muted)' }}>Nombre del grupo</label>
            <input value={groupName} onChange={e => setGroupName(e.target.value)}
              placeholder="Ej: Amigos universidad"
              className="w-full px-3 py-2 rounded-lg font-sans text-sm mb-4"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }} />
            <label className="block font-sans text-xs mb-2" style={{ color: 'var(--color-muted)' }}>Color</label>
            <div className="flex flex-wrap gap-2 mb-5">
              {GROUP_COLORS.map(c => (
                <button key={c} onClick={() => setGroupColor(c)} className="rounded-full transition-transform"
                  style={{ width: 28, height: 28, background: c,
                    border: groupColor === c ? '3px solid var(--color-dark)' : '2px solid transparent',
                    transform: groupColor === c ? 'scale(1.15)' : 'scale(1)' }} />
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowGroupModal(false)}
                className="flex-1 py-2.5 rounded-xl font-sans text-sm"
                style={{ background: 'var(--color-khaki)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>Cancelar</button>
              <button onClick={() => void handleSaveGroup()}
                className="flex-1 py-2.5 rounded-xl font-sans text-sm font-medium"
                style={{ background: 'var(--color-dark)', color: 'white' }}>{editingGroup ? 'Guardar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Table modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(44,32,18,0.55)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" style={{ border: '1px solid var(--color-border)' }}>
            <h3 className="font-serif text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
              {editingTable ? 'Editar mesa' : 'Nueva mesa'}
            </h3>
            <label className="block font-sans text-xs mb-1" style={{ color: 'var(--color-muted)' }}>Nombre</label>
            <input value={tableName} onChange={e => setTableName(e.target.value)}
              placeholder="Ej: Mesa 1, Mesa novios"
              className="w-full px-3 py-2 rounded-lg font-sans text-sm mb-4"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }} />
            <label className="block font-sans text-xs mb-2" style={{ color: 'var(--color-muted)' }}>Forma</label>
            <div className="flex gap-3 mb-4">
              {([
                { value: 'circle' as const, label: 'Circular', icon: '⬤' },
                { value: 'square' as const, label: 'Cuadrada', icon: '⬜' },
                { value: 'rectangle' as const, label: 'Rectangular', icon: '▬' },
              ]).map(s => (
                <button key={s.value}
                  onClick={() => { setTableShape(s.value); setTableCapacity(TABLE_DEFAULTS[s.value].capacity) }}
                  className="flex-1 py-3 rounded-xl font-sans text-xs text-center transition-all"
                  style={{
                    background: tableShape === s.value ? 'var(--color-dark)' : 'var(--color-surface)',
                    color: tableShape === s.value ? 'white' : 'var(--color-dark)',
                    border: `1px solid ${tableShape === s.value ? 'var(--color-dark)' : 'var(--color-border)'}`,
                  }}>
                  <div className="text-xl mb-1">{s.icon}</div>{s.label}
                </button>
              ))}
            </div>
            <label className="block font-sans text-xs mb-1" style={{ color: 'var(--color-muted)' }}>Capacidad (asientos)</label>
            <input type="number" min={1} max={20} value={tableCapacity}
              onChange={e => setTableCapacity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-lg font-sans text-sm mb-5"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }} />
            <div className="flex gap-3">
              <button onClick={() => setShowTableModal(false)}
                className="flex-1 py-2.5 rounded-xl font-sans text-sm"
                style={{ background: 'var(--color-khaki)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>Cancelar</button>
              <button onClick={() => void handleSaveTable()}
                className="flex-1 py-2.5 rounded-xl font-sans text-sm font-medium"
                style={{ background: 'var(--color-dark)', color: 'white' }}>{editingTable ? 'Guardar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
