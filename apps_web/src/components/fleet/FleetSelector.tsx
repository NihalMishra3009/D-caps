/**
 * FleetSelector Component (aws_design.md Section 9 & 13)
 * Renders compact fleet vehicle cards with status, registration, and capacity.
 */

import React from 'react'
import { Truck } from 'lucide-react'

export interface VehicleSelectorItem {
  id: string
  carNo: string
  carGrade?: string
  maxWeight: number
  warehouseCode?: string
  loadCapacity?: number
  utilizationPct?: number
  dropsCount?: number
  status?: 'active' | 'idle' | 'warning'
}

interface FleetSelectorProps {
  vehicles: VehicleSelectorItem[]
  selectedVehicleId: string | null
  onSelectVehicle: (vehicle: VehicleSelectorItem) => void
}

export const FleetSelector: React.FC<FleetSelectorProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        padding: '4px 2px 14px',
        scrollbarWidth: 'thin',
      }}
    >
      {vehicles.map((v) => {
        const isSelected = v.id === selectedVehicleId || v.carNo === selectedVehicleId
        const isContracted = v.carNo.includes('CON')
        const status = v.status || (isContracted ? 'warning' : 'active')
        const utilPct = v.utilizationPct ?? (v.loadCapacity && v.maxWeight ? Math.round((v.loadCapacity / v.maxWeight) * 100) : 0)

        return (
          <button
            key={v.id}
            onClick={() => onSelectVehicle(v)}
            style={{
              flex: '0 0 auto',
              minWidth: 160,
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isSelected ? 'var(--bg-surface)' : 'var(--bg-surface)',
              border: isSelected ? '2px solid var(--accent-purple)' : '1px solid var(--border)',
              boxShadow: isSelected ? '0 4px 14px rgba(114, 23, 245, 0.12)' : 'var(--shadow-sm)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--transition-fast)',
              position: 'relative',
              outline: 'none',
            }}
          >
            {/* Top Row: Reg & Status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: isSelected ? 'var(--accent-purple)' : 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}
              >
                {v.carNo}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span
                  className={`status-dot status-dot-${
                    status === 'active' ? 'success' : status === 'warning' ? 'warning' : 'idle'
                  }`}
                />
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {status}
                </span>
              </div>
            </div>

            {/* Middle Row: Capacity / Grade */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
              <span>{v.carGrade || `${(v.maxWeight / 1000).toFixed(1)}T Grade`}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {Number(v.maxWeight).toLocaleString()} kg
              </span>
            </div>

            {/* Bottom Row: Utilization Mini Bar (if available) */}
            {utilPct > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>
                  <span>Util.</span>
                  <span style={{ fontWeight: 600, color: utilPct > 100 ? 'var(--status-error)' : 'var(--text-primary)' }}>
                    {utilPct}%
                  </span>
                </div>
                <div style={{ width: '100%', height: 4, backgroundColor: 'var(--bg-surface-muted)', borderRadius: 2, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, utilPct)}%`,
                      height: '100%',
                      backgroundColor: utilPct > 100 ? 'var(--status-error)' : utilPct >= 80 ? 'var(--status-success)' : 'var(--accent-purple)',
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default FleetSelector
