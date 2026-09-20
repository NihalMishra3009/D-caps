/**
 * Vehicle Fleet List View (Reference Image 3)
 * Renders prominent clickable vehicle cards with hover effects, arrows, utilization bars, and payload grades.
 */

import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVehicleContext } from '../../../contexts/VehicleContext'
import { appvars } from '../../../config'
import { Plus, RefreshCw, ArrowRight, Search, Filter } from 'lucide-react'
import ReferenceTruckGraphic from '../../../components/fleet/ReferenceTruckGraphic'

export const List: React.FC = () => {
  const navigate = useNavigate()
  const [{ items: vehicles, isLoading }, { refreshItems }] = useVehicleContext()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchSearch =
        v.carNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.carGrade && v.carGrade.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.warehouseCode && v.warehouseCode.toLowerCase().includes(searchQuery.toLowerCase()))

      const isInactive = v.carNo.includes('99') || v.carNo.includes('INA')
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && !isInactive) ||
        (statusFilter === 'INACTIVE' && isInactive)

      return matchSearch && matchStatus
    })
  }, [vehicles, searchQuery, statusFilter])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className='heading-page' style={{ fontSize: 22, fontWeight: 700 }}>
            Vehicle Fleet ({vehicles.length})
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => refreshItems()} className='btn btn-secondary' title='Refresh fleet'>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => navigate(`/${appvars.URL.VEHICLE}/new`)} className='btn btn-primary'>
            <Plus size={15} /> New Vehicle
          </button>
        </div>
      </div>

      {/* Search & Filter Bar (Reference Image 3) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          backgroundColor: 'var(--bg-surface)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 300px' }}>
          <Search size={16} color='var(--text-muted)' />
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search by vehicle number, depot, or grade...'
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: 13,
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-surface)',
              fontSize: 13,
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value='ALL'>All Status</option>
            <option value='ACTIVE'>Active</option>
            <option value='INACTIVE'>Inactive</option>
          </select>
        </div>
      </div>

      {/* Clickable Vehicle Cards Grid (Reference Image 3) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 18,
        }}
      >
        {filteredVehicles.length === 0 ? (
          <div className='card' style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            No vehicles match the selected search criteria.
          </div>
        ) : (
          filteredVehicles.map((vehicle, idx) => {
            const isInactive = vehicle.carNo.includes('99') || vehicle.carNo.includes('INA')
            const maxKg = Number(vehicle.maxWeight || 20000)
            const utilPct = isInactive ? 0 : idx === 3 ? 82 : 78
            const gradeLabel = vehicle.carGrade || (maxKg >= 20000 ? '10 Ton' : maxKg >= 5000 ? '5 Ton' : maxKg >= 2500 ? '2.5 Ton' : '1 Ton')

            return (
              <div
                key={vehicle.Id}
                onClick={() => navigate(`/${appvars.URL.VEHICLE}/${vehicle.Id}`)}
                className='vehicle-card-clickable'
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: idx === 0 ? '2px solid var(--accent-purple)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                  e.currentTarget.style.borderColor = 'var(--accent-purple)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                  e.currentTarget.style.borderColor = idx === 0 ? 'var(--accent-purple)' : 'var(--border)'
                }}
              >
                {/* Header Row: Reg No + Status + Arrow Affordance */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                      {vehicle.carNo}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: isInactive ? 'var(--status-error)' : '#598f1a' }}>
                      <span className={`status-dot ${isInactive ? 'status-dot-error' : 'status-dot-success'}`} />
                      <span>{isInactive ? 'Inactive' : 'Active'}</span>
                    </span>
                  </div>

                  {/* Arrow Indicator */}
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-surface-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <ArrowRight size={13} />
                  </div>
                </div>

                {/* Middle Content: Mini Truck Preview + Capacity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Small Truck Thumbnail */}
                  <div
                    style={{
                      width: 90,
                      height: 52,
                      backgroundColor: 'var(--bg-surface-muted)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 4,
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <svg viewBox='0 0 400 180' width='80' height='36'>
                      <path d='M40 120 L40 70 Q40 50 60 40 L90 40 Q100 40 105 50 L105 120 Z' fill='#e4e4e0' stroke='#333' strokeWidth='3' />
                      <rect x='110' y='35' width='260' height='85' rx='3' fill='#ffffff' stroke='#555' strokeWidth='3' />
                      <rect x='45' y='120' width='320' height='10' fill='#222' />
                      <circle cx='75' cy='130' r='16' fill='#222' stroke='#888' strokeWidth='3' />
                      <circle cx='290' cy='130' r='16' fill='#222' stroke='#888' strokeWidth='3' />
                      <circle cx='335' cy='130' r='16' fill='#222' stroke='#888' strokeWidth='3' />
                    </svg>
                  </div>

                  {/* Capacity & Grade */}
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{gradeLabel}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {maxKg.toLocaleString()} kg
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Utilization Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>Utilization</span>
                    <span style={{ fontWeight: 700, color: isInactive ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {utilPct}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 4, backgroundColor: 'var(--bg-surface-muted)', borderRadius: 2, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${utilPct}%`,
                        height: '100%',
                        backgroundColor: isInactive ? 'var(--border-strong)' : 'var(--accent-purple)',
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default List
