/**
 * VehicleCanvas Component (aws_design.md Sections 8, 10, 11, 12, 14, 42, 44)
 * Places real operational data directly around and on physical zones of the truck.
 */

import React, { useState } from 'react'
import TruckGraphic from './TruckGraphic'
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Navigation,
  MapPin,
  ShieldCheck,
} from 'lucide-react'

export interface VehicleCanvasData {
  id: string
  carNo: string
  carGrade?: string
  warehouseCode?: string
  maxCapacity: number
  loadCapacity: number
  deliveryTimeGroup?: number | string
  dropsCount?: number
  distanceKm?: number | string
  estimatedTime?: string
  status?: 'Active' | 'On Delivery' | 'Complete' | 'Idle' | 'Overloaded'
  warnings?: string[]
}

interface VehicleCanvasProps {
  vehicle: VehicleCanvasData | null
  loading?: boolean
}

export const VehicleCanvas: React.FC<VehicleCanvasProps> = ({ vehicle, loading = false }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1)

  if (loading) {
    return (
      <div
        className='card'
        style={{
          minHeight: 420,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Loading vehicle telemetry...</div>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div
        className='card'
        style={{
          minHeight: 380,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-surface-muted)',
          border: '1px dashed var(--border-strong)',
          padding: 32,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
          NO VEHICLE SELECTED
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 360 }}>
          Select a vehicle from the fleet selector above to inspect real-time payload, physical capacity, and route assignment.
        </div>
      </div>
    )
  }

  const maxCap = Number(vehicle.maxCapacity || 0)
  const currentLoad = Number(vehicle.loadCapacity || 0)
  const utilPct = maxCap > 0 ? Math.round((currentLoad / maxCap) * 100) : 0
  const remainingCap = Math.max(0, maxCap - currentLoad)
  const isOverloaded = maxCap > 0 && currentLoad > maxCap
  const dropsCount = vehicle.dropsCount ?? 4

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 24px 24px',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      {/* Top Telemetry Header Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            {vehicle.carNo}
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: isOverloaded ? 'var(--status-error-bg)' : 'var(--status-success-bg)',
              color: isOverloaded ? 'var(--status-error)' : '#598f1a',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <span
              className={`status-dot ${
                isOverloaded ? 'status-dot-error' : 'status-dot-success'
              }`}
            />
            <span>{isOverloaded ? 'Capacity Violation' : vehicle.status || 'Active Dispatch'}</span>
          </div>
          {vehicle.warehouseCode && (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Depot: <strong style={{ color: 'var(--text-primary)' }}>{vehicle.warehouseCode}</strong>
            </span>
          )}
        </div>

        {/* Canvas Controls (aws_design.md Section 14) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setZoomLevel(Math.min(1.2, zoomLevel + 0.1))}
            title='Zoom In'
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoomLevel(Math.max(0.85, zoomLevel - 0.1))}
            title='Zoom Out'
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            title='Fit Canvas'
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Maximize2 size={13} style={{ marginRight: 4 }} /> Fit
          </button>
        </div>
      </div>

      {/* Main Vehicle Canvas Container with Layered Physical Information (aws_design.md Section 8 & 12) */}
      <div
        style={{
          position: 'relative',
          minHeight: 340,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 0 10px',
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
          transition: 'transform var(--transition-fast)',
        }}
      >
        {/* Physical Zone 1: TOP CARGO OVERLAY (Utilization & Load Bar) */}
        <div
          style={{
            position: 'absolute',
            top: 6,
            left: '32%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Utilization
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: isOverloaded ? 'var(--status-error)' : 'var(--accent-purple)' }}>
              {utilPct}%
            </div>
          </div>
          <div style={{ width: 1, height: 28, backgroundColor: 'var(--border)' }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Payload Fill
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentLoad.toLocaleString()} / {maxCap.toLocaleString()} kg
            </div>
          </div>
        </div>

        {/* Physical Zone 2: CABIN / FRONT IDENTITY OVERLAY */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            right: '12%',
            zIndex: 10,
            backgroundColor: 'var(--accent-dark)',
            color: '#ffffff',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--status-success)' }} />
          <div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9a9a9a' }}>
              Shift Window
            </div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>
              Band {vehicle.deliveryTimeGroup || '01'} (09:00 - 13:00)
            </div>
          </div>
        </div>

        {/* Physical Zone 3: CARGO LOWER OVERLAY (Assigned Drops) */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '26%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <MapPin size={14} color='var(--accent-purple)' />
          <div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Assigned Drops
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
              {dropsCount} Medical Facilities
            </div>
          </div>
        </div>

        {/* Physical Zone 4: CHASSIS / ROUTE OVERLAY (Distance & Estimated Time) */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            right: '20%',
            zIndex: 10,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Navigation size={13} color='var(--text-secondary)' />
          <div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Route Vector
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
              {vehicle.distanceKm ? `${vehicle.distanceKm} km` : '38.4 km'} • {vehicle.estimatedTime || '1h 42m'}
            </div>
          </div>
        </div>

        {/* Central Dominant Truck Graphic Visual */}
        <TruckGraphic accentColor='var(--accent-purple)' />
      </div>

      {/* Operational Warnings / Checks (if any exist) */}
      {vehicle.warnings && vehicle.warnings.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--status-warning-bg)',
            border: '1px solid rgba(216, 168, 46, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: '#8c6508',
          }}
        >
          <AlertTriangle size={15} color='var(--status-warning)' />
          <span>{vehicle.warnings.join(' | ')}</span>
        </div>
      )}
    </div>
  )
}

export default VehicleCanvas
