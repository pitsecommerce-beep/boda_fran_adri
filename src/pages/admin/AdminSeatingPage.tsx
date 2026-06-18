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
  const [zoom, setZoom] = useState(1)

  const canvasRef = useRef<HTMLDivElement>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)

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
      await createSeatingTable({
        name: tableName.trim(),
        shape: tableShape,
        capacity: tableCapacity,
        x: 200 + Math.random() * 200,
        y: 150 + Math.random() * 200,
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

  // ── Drag & Drop ───────────────────────────────────────────────────
  const handleTableMouseDown = (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation()
    const table = tables.find(t => t.id === tableId)
    if (!table) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    setDraggingTable(tableId)
    setDragOffset({
      x: (e.clientX - rect.left) / zoom - table.x,
      y: (e.clientY - rect.top) / zoom - table.y,
    })
    setSelectedTable(tableId)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggingTable) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const newX = Math.max(0, (e.clientX - rect.left) / zoom - dragOffset.x)
    const newY = Math.max(0, (e.clientY - rect.top) / zoom - dragOffset.y)
    setTables(prev => prev.map(t => t.id === draggingTable ? { ...t, x: newX, y: newY } : t))
  }

  const handleCanvasMouseUp = async () => {
    if (draggingTable) {
      const table = tables.find(t => t.id === draggingTable)
      if (table) await updateSeatingTable(draggingTable, { x: table.x, y: table.y })
      setDraggingTable(null)
    }
  }

  const handleGuestDragStart = (guestId: string) => {
    setDraggingGuest(guestId)
  }

  const handleTableDrop = async (tableId: string) => {
    if (!draggingGuest) return
    const tableGuests = assignmentsByTable[tableId] ?? []
    const table = tables.find(t => t.id === tableId)
    if (table && tableGuests.length >= table.capacity) return
    await assignGuestToTable(draggingGuest, tableId)
    setDraggingGuest(null)
    void loadData()
  }

  const handleRemoveFromTable = async (guestId: string) => {
    await removeGuestFromTable(guestId)
    void loadData()
  }

  // ── Render table shape ────────────────────────────────────────────
  const renderTableShape = (table: SeatingTable, isSelected: boolean) => {
    const tableGuests = assignmentsByTable[table.id] ?? []
    const isFull = tableGuests.length >= table.capacity
    const fillColor = isSelected ? 'var(--color-yellow)' : isFull ? '#ddd5c8' : 'white'
    const borderColor = isSelected ? 'var(--color-dark)' : 'var(--color-gold-light)'

    const style: React.CSSProperties = {
      position: 'absolute',
      left: table.x,
      top: table.y,
      width: table.width,
      height: table.height,
      background: fillColor,
      border: `2px solid ${borderColor}`,
      borderRadius: table.shape === 'circle' ? '50%' : table.shape === 'square' ? '12px' : '16px',
      cursor: 'grab',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.08)',
      transition: draggingTable === table.id ? 'none' : 'box-shadow 0.2s',
      zIndex: isSelected ? 10 : 1,
      userSelect: 'none',
    }

    return (
      <div
        key={table.id}
        style={style}
        onMouseDown={e => handleTableMouseDown(e, table.id)}
        onClick={() => setSelectedTable(table.id)}
        onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
        onDrop={e => { e.preventDefault(); void handleTableDrop(table.id) }}
      >
        <span className="font-sans text-xs font-semibold" style={{ color: 'var(--color-dark)', lineHeight: 1.1, textAlign: 'center' }}>
          {table.name}
        </span>
        <span className="font-sans" style={{ fontSize: '0.65rem', color: 'var(--color-muted)' }}>
          {tableGuests.length}/{table.capacity}
        </span>
      </div>
    )
  }

  const getFirstName = (fullName: string) => fullName.split(' ')[0]

  // ── Render seats around table (visual indicators + first name) ────
  const renderSeats = (table: SeatingTable) => {
    const tableGuests = assignmentsByTable[table.id] ?? []
    const seats: React.ReactNode[] = []
    const cx = table.x + table.width / 2
    const cy = table.y + table.height / 2
    const seatRadius = 14
    const gap = 22
    const rx = table.width / 2 + gap
    const ry = table.height / 2 + gap

    for (let i = 0; i < table.capacity; i++) {
      const angle = (2 * Math.PI * i) / table.capacity - Math.PI / 2
      const sx = cx + rx * Math.cos(angle)
      const sy = cy + ry * Math.sin(angle)
      const guest = tableGuests[i] ? guestMap[tableGuests[i]] : null
      const group = guest?.group_id ? groupMap[guest.group_id] : null
      const firstName = guest ? getFirstName(guest.name) : null

      const labelDist = seatRadius + 10
      const lx = cx + (rx + labelDist) * Math.cos(angle)
      const ly = cy + (ry + labelDist) * Math.sin(angle)

      seats.push(
        <div key={`${table.id}-seat-${i}`}>
          <div
            title={guest?.name ?? 'Libre'}
            style={{
              position: 'absolute',
              left: sx - seatRadius,
              top: sy - seatRadius,
              width: seatRadius * 2,
              height: seatRadius * 2,
              borderRadius: '50%',
              background: guest ? (group?.color ?? 'var(--color-gold)') : 'var(--color-khaki)',
              border: guest ? '2px solid white' : '1px dashed var(--color-gold-light)',
              boxShadow: guest ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
              zIndex: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {guest && (
              <span style={{ color: 'white', fontSize: '0.5rem', fontWeight: 700, fontFamily: 'var(--font-sans)', lineHeight: 1, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                {firstName!.charAt(0)}
              </span>
            )}
          </div>
          {guest && (
            <span
              style={{
                position: 'absolute',
                left: lx,
                top: ly,
                transform: 'translate(-50%, -50%)',
                fontSize: '0.55rem',
                fontFamily: 'var(--font-sans)',
                color: 'var(--color-dark)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                fontWeight: 500,
                zIndex: 0,
              }}
            >
              {firstName}
            </span>
          )}
        </div>,
      )
    }
    return seats
  }

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

  return (
    <AdminLayout title="Plano de Mesas">
      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="px-4 py-2 rounded-xl font-sans text-sm" style={{ background: 'white', border: '1px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-muted)' }}>Mesas: </span>
          <strong style={{ color: 'var(--color-dark)' }}>{tables.length}</strong>
        </div>
        <div className="px-4 py-2 rounded-xl font-sans text-sm" style={{ background: 'white', border: '1px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-muted)' }}>Sentados: </span>
          <strong style={{ color: 'var(--color-dark)' }}>{assignments.length}/{guests.length}</strong>
        </div>
        <div className="px-4 py-2 rounded-xl font-sans text-sm" style={{ background: unseatedCount > 0 ? '#FEF3CD' : '#D4EDDA', border: '1px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-muted)' }}>Sin mesa: </span>
          <strong style={{ color: unseatedCount > 0 ? '#856404' : '#155724' }}>{unseatedCount}</strong>
        </div>
        <div className="px-4 py-2 rounded-xl font-sans text-sm" style={{ background: 'white', border: '1px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-muted)' }}>Grupos: </span>
          <strong style={{ color: 'var(--color-dark)' }}>{groups.length}</strong>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'var(--color-khaki)' }}>
        <button
          onClick={() => setTab('plan')}
          className="flex-1 py-2 rounded-lg font-sans text-sm transition-all"
          style={{
            background: tab === 'plan' ? 'white' : 'transparent',
            color: 'var(--color-dark)',
            fontWeight: tab === 'plan' ? 600 : 400,
            boxShadow: tab === 'plan' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          Plano de Mesas
        </button>
        <button
          onClick={() => setTab('groups')}
          className="flex-1 py-2 rounded-lg font-sans text-sm transition-all"
          style={{
            background: tab === 'groups' ? 'white' : 'transparent',
            color: 'var(--color-dark)',
            fontWeight: tab === 'groups' ? 600 : 400,
            boxShadow: tab === 'groups' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          Grupos de Invitados
        </button>
      </div>

      {tab === 'plan' && (
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Canvas area */}
          <div className="flex-1">
            {/* Canvas toolbar */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => { setEditingTable(null); setTableName(''); setTableShape('circle'); setTableCapacity(8); setShowTableModal(true) }}
                className="px-4 py-2 rounded-xl font-sans text-sm font-medium"
                style={{ background: 'var(--color-dark)', color: 'white' }}
              >
                + Agregar mesa
              </button>
              {selectedTableObj && (
                <>
                  <button
                    onClick={() => {
                      setEditingTable(selectedTableObj)
                      setTableName(selectedTableObj.name)
                      setTableShape(selectedTableObj.shape)
                      setTableCapacity(selectedTableObj.capacity)
                      setShowTableModal(true)
                    }}
                    className="px-3 py-2 rounded-xl font-sans text-xs"
                    style={{ background: 'var(--color-yellow)22', color: 'var(--color-dark)', border: '1px solid var(--color-border)' }}
                  >
                    Editar "{selectedTableObj.name}"
                  </button>
                  <button
                    onClick={() => void handleDeleteTable(selectedTableObj.id)}
                    className="px-3 py-2 rounded-xl font-sans text-xs"
                    style={{ background: '#E0555522', color: '#E05555', border: '1px solid #E0555533' }}
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-2 mb-3 ml-auto" style={{ width: 'fit-content' }}>
              <button
                onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}
                className="w-8 h-8 rounded-lg font-sans text-sm font-bold flex items-center justify-center"
                style={{ background: 'white', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }}
              >
                -
              </button>
              <span className="font-sans text-xs min-w-[3rem] text-center" style={{ color: 'var(--color-muted)' }}>
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                className="w-8 h-8 rounded-lg font-sans text-sm font-bold flex items-center justify-center"
                style={{ background: 'white', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }}
              >
                +
              </button>
              <button
                onClick={() => setZoom(1)}
                className="px-2 h-8 rounded-lg font-sans text-xs flex items-center justify-center"
                style={{ background: 'white', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
              >
                Reset
              </button>
            </div>

            {/* Floor plan canvas */}
            <div
              ref={canvasWrapRef}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={() => void handleCanvasMouseUp()}
              onMouseLeave={() => void handleCanvasMouseUp()}
              className="rounded-2xl overflow-auto"
              style={{
                border: '2px solid var(--color-border)',
                height: 600,
                background: '#f5f2ec',
              }}
            >
              <div
                ref={canvasRef}
                onClick={() => setSelectedTable(null)}
                className="relative"
                style={{
                  width: 1600,
                  height: 1200,
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  background: `white`,
                  backgroundImage: 'radial-gradient(circle, rgba(184,150,110,0.25) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              >
                {tables.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="font-serif text-xl mb-2" style={{ color: 'var(--color-muted)' }}>
                      No hay mesas todavia
                    </p>
                    <p className="font-sans text-sm" style={{ color: 'var(--color-muted)' }}>
                      Haz clic en "Agregar mesa" para empezar a disenar el plano
                    </p>
                  </div>
                ) : (
                  tables.map(table => (
                    <div key={table.id}>
                      {renderSeats(table)}
                      {renderTableShape(table, selectedTable === table.id)}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Selected table detail */}
            {selectedTableObj && (
              <div className="mt-4 p-4 rounded-xl" style={{ background: 'white', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-lg" style={{ color: 'var(--color-dark)' }}>
                    {selectedTableObj.name}
                    <span className="font-sans text-xs ml-2" style={{ color: 'var(--color-muted)' }}>
                      ({selectedTableObj.shape === 'circle' ? 'Circular' : selectedTableObj.shape === 'square' ? 'Cuadrada' : 'Rectangular'})
                    </span>
                  </h3>
                  <span className="font-sans text-sm" style={{ color: selectedTableGuests.length >= selectedTableObj.capacity ? '#E05555' : 'var(--color-muted)' }}>
                    {selectedTableGuests.length}/{selectedTableObj.capacity} asientos
                  </span>
                </div>
                {selectedTableGuests.length === 0 ? (
                  <p className="font-sans text-sm italic" style={{ color: 'var(--color-muted)' }}>
                    Arrastra invitados desde la lista para sentarlos aqui.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedTableGuests.map(gId => {
                      const guest = guestMap[gId]
                      if (!guest) return null
                      const grp = guest.group_id ? groupMap[guest.group_id] : null
                      return (
                        <div key={gId} className="flex items-center gap-2 px-3 py-1.5 rounded-full font-sans text-xs"
                          style={{ background: grp ? `${grp.color}22` : 'var(--color-khaki)', border: `1px solid ${grp?.color ?? 'var(--color-border)'}` }}>
                          {grp && <span style={{ width: 8, height: 8, borderRadius: '50%', background: grp.color, display: 'inline-block' }} />}
                          {guest.name}
                          <button
                            onClick={() => void handleRemoveFromTable(gId)}
                            className="ml-1 opacity-50 hover:opacity-100"
                            title="Quitar de la mesa"
                          >
                            x
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Guest sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid var(--color-border)' }}>
              <h3 className="font-serif text-lg mb-3" style={{ color: 'var(--color-dark)' }}>Invitados</h3>

              <input
                type="text"
                placeholder="Buscar invitado..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg font-sans text-sm mb-2"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }}
              />

              <div className="flex gap-2 mb-2">
                <select
                  value={filterGroup}
                  onChange={e => setFilterGroup(e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded-lg font-sans text-xs"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }}
                >
                  <option value="all">Todos los grupos</option>
                  <option value="none">Sin grupo</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <select
                  value={filterSeat}
                  onChange={e => setFilterSeat(e.target.value as 'all' | 'seated' | 'unseated')}
                  className="px-2 py-1.5 rounded-lg font-sans text-xs"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }}
                >
                  <option value="all">Todos</option>
                  <option value="unseated">Sin mesa</option>
                  <option value="seated">Sentados</option>
                </select>
              </div>

              <p className="font-sans text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
                {filteredGuests.length} invitados
              </p>

              <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                {filteredGuests.map(guest => {
                  const isSeated = assignedGuestIds.has(guest.id)
                  const grp = guest.group_id ? groupMap[guest.group_id] : null
                  return (
                    <div
                      key={guest.id}
                      draggable
                      onDragStart={() => handleGuestDragStart(guest.id)}
                      onDragEnd={() => setDraggingGuest(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-grab hover:shadow-sm transition-all"
                      style={{
                        background: isSeated ? 'var(--color-khaki)' : 'var(--color-surface)',
                        border: `1px solid ${grp?.color ?? 'var(--color-border)'}`,
                        opacity: isSeated ? 0.6 : 1,
                      }}
                    >
                      {grp && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: grp.color, flexShrink: 0 }} />
                      )}
                      <span className="font-sans text-xs flex-1 truncate" style={{ color: 'var(--color-dark)' }}>
                        {guest.name}
                      </span>
                      {isSeated && (
                        <span className="font-sans text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-gold-light)33', color: 'var(--color-muted)', fontSize: '0.6rem' }}>
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
          {/* Groups list */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => { setEditingGroup(null); setGroupName(''); setGroupColor(GROUP_COLORS[groups.length % GROUP_COLORS.length]); setShowGroupModal(true) }}
                className="px-4 py-2 rounded-xl font-sans text-sm font-medium"
                style={{ background: 'var(--color-dark)', color: 'white' }}
              >
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
                  const groupGuests = guests.filter(g => g.group_id === group.id)
                  return (
                    <div key={group.id} className="rounded-xl p-4" style={{ background: 'white', border: `2px solid ${group.color}33` }}>
                      <div className="flex items-center gap-3 mb-3">
                        <span style={{ width: 14, height: 14, borderRadius: '50%', background: group.color, flexShrink: 0 }} />
                        <h3 className="font-sans text-sm font-semibold flex-1" style={{ color: 'var(--color-dark)' }}>{group.name}</h3>
                        <span className="font-sans text-xs" style={{ color: 'var(--color-muted)' }}>{groupGuests.length} invitados</span>
                        <button
                          onClick={() => { setEditingGroup(group); setGroupName(group.name); setGroupColor(group.color); setShowGroupModal(true) }}
                          className="px-2 py-1 rounded-lg font-sans text-xs"
                          style={{ background: 'var(--color-surface)', color: 'var(--color-muted)' }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => void handleDeleteGroup(group.id)}
                          className="px-2 py-1 rounded-lg font-sans text-xs"
                          style={{ color: '#E05555' }}
                        >
                          Eliminar
                        </button>
                      </div>
                      {groupGuests.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {groupGuests.map(g => (
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

          {/* Assign guests to groups */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid var(--color-border)' }}>
              <h3 className="font-serif text-lg mb-3" style={{ color: 'var(--color-dark)' }}>Asignar a grupo</h3>
              <input
                type="text"
                placeholder="Buscar invitado..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg font-sans text-sm mb-3"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }}
              />
              <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                {(search ? filteredGuests : guests.filter(g => !g.group_id)).slice(0, 50).map(guest => {
                  const grp = guest.group_id ? groupMap[guest.group_id] : null
                  return (
                    <div key={guest.id} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                      {grp && <span style={{ width: 8, height: 8, borderRadius: '50%', background: grp.color, flexShrink: 0 }} />}
                      <span className="font-sans text-xs flex-1 truncate" style={{ color: 'var(--color-dark)' }}>{guest.name}</span>
                      <select
                        value={guest.group_id ?? ''}
                        onChange={e => void handleAssignGroup(guest.id, e.target.value || null)}
                        className="px-1.5 py-1 rounded font-sans text-xs"
                        style={{ background: 'white', border: '1px solid var(--color-border)', color: 'var(--color-dark)', maxWidth: 110 }}
                      >
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
            <input
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="Ej: Amigos universidad"
              className="w-full px-3 py-2 rounded-lg font-sans text-sm mb-4"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }}
            />
            <label className="block font-sans text-xs mb-2" style={{ color: 'var(--color-muted)' }}>Color</label>
            <div className="flex flex-wrap gap-2 mb-5">
              {GROUP_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setGroupColor(c)}
                  className="rounded-full transition-transform"
                  style={{
                    width: 28, height: 28, background: c,
                    border: groupColor === c ? '3px solid var(--color-dark)' : '2px solid transparent',
                    transform: groupColor === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowGroupModal(false)}
                className="flex-1 py-2.5 rounded-xl font-sans text-sm"
                style={{ background: 'var(--color-khaki)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                Cancelar
              </button>
              <button onClick={() => void handleSaveGroup()}
                className="flex-1 py-2.5 rounded-xl font-sans text-sm font-medium"
                style={{ background: 'var(--color-dark)', color: 'white' }}>
                {editingGroup ? 'Guardar' : 'Crear'}
              </button>
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
            <input
              value={tableName}
              onChange={e => setTableName(e.target.value)}
              placeholder="Ej: Mesa 1, Mesa novios"
              className="w-full px-3 py-2 rounded-lg font-sans text-sm mb-4"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }}
            />

            <label className="block font-sans text-xs mb-2" style={{ color: 'var(--color-muted)' }}>Forma</label>
            <div className="flex gap-3 mb-4">
              {[
                { value: 'circle' as const, label: 'Circular', icon: '⬤' },
                { value: 'square' as const, label: 'Cuadrada', icon: '⬜' },
                { value: 'rectangle' as const, label: 'Rectangular', icon: '▬' },
              ].map(s => (
                <button
                  key={s.value}
                  onClick={() => { setTableShape(s.value); setTableCapacity(TABLE_DEFAULTS[s.value].capacity) }}
                  className="flex-1 py-3 rounded-xl font-sans text-xs text-center transition-all"
                  style={{
                    background: tableShape === s.value ? 'var(--color-dark)' : 'var(--color-surface)',
                    color: tableShape === s.value ? 'white' : 'var(--color-dark)',
                    border: `1px solid ${tableShape === s.value ? 'var(--color-dark)' : 'var(--color-border)'}`,
                  }}
                >
                  <div className="text-xl mb-1">{s.icon}</div>
                  {s.label}
                </button>
              ))}
            </div>

            <label className="block font-sans text-xs mb-1" style={{ color: 'var(--color-muted)' }}>Capacidad (asientos)</label>
            <input
              type="number"
              min={1}
              max={20}
              value={tableCapacity}
              onChange={e => setTableCapacity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-lg font-sans text-sm mb-5"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-dark)' }}
            />

            <div className="flex gap-3">
              <button onClick={() => setShowTableModal(false)}
                className="flex-1 py-2.5 rounded-xl font-sans text-sm"
                style={{ background: 'var(--color-khaki)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                Cancelar
              </button>
              <button onClick={() => void handleSaveTable()}
                className="flex-1 py-2.5 rounded-xl font-sans text-sm font-medium"
                style={{ background: 'var(--color-dark)', color: 'white' }}>
                {editingTable ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
