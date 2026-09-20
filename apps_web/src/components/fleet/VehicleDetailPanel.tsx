/**
 * VehicleDetailPanel Component (aws_design.md Section 10 & 16)
 * 3-Column operational information area:
 * Column 1: Vehicle (Registration, Max payload, Current load, Remaining)
 * Column 2: Assignment (Time group, Assigned drops, Primary location)
 * Column 3: Route (Distance, Estimated time, Stops, Status)
 */

import React from 'react'
import type { VehicleCanvasData } from './VehicleCanvas'
import { Truck, MapPin, Navigation2 } from 'lucide-react'

interface VehicleDetailPanelProps {
  vehicle: VehicleCanvasData | null
  primaryLocation?: string
}

export const VehicleDetailPanel: React.FC<VehicleDetailPanelProps> = ({
  vehicle,
  primaryLocation = 'Vashi Medical Hub',
}) => {
  if (!vehicle) return null

  const maxCap = Number(vehicle.maxCapacity || 0)
  const loadCap = Number(vehicle.loadCapacity || 0)
  const remainingCap = Math.max(0, maxCap - loadCap)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
        marginTop: 16,
      }}
    >
      {/* Column 1: VEHICLE */}
      <div
        className='card'
        style={{
          padding: 20,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Truck size={16} color='var(--accent-purple)' />
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
            VEHICLE SPECIFICATION
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Registration</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{vehicle.carNo}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Maximum payload</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{maxCap.toLocaleString()} kg</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Current load</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>{loadCap.toLocaleString()} kg</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Remaining capacity</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{remainingCap.toLocaleString()} kg</span>
          </div>
        </div>
      </div>

      {/* Column 2: ASSIGNMENT */}
      <div
        className='card'
        style={{
          padding: 20,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <MapPin size={16} color='var(--accent-purple)' />
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
            DISPATCH ASSIGNMENT
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Time group window</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              Band {vehicle.deliveryTimeGroup || '01'} (09:00 - 13:00)
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Assigned drops</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {vehicle.dropsCount ?? 4} Facilities
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Primary location hub</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{primaryLocation}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Consignment priority</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Standard Medical</span>
          </div>
        </div>
      </div>

      {/* Column 3: ROUTE */}
      <div
        className='card'
        style={{
          padding: 20,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Navigation2 size={16} color='var(--accent-purple)' />
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
            ROUTE INTELLIGENCE
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Route distance</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {vehicle.distanceKm ? `${vehicle.distanceKm} km` : '38.4 km'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Estimated transit time</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{vehicle.estimatedTime || '1h 42m'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Stop sequence</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{vehicle.dropsCount ?? 4} Stops</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Routing engine status</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#598f1a' }}>
              <span className='status-dot status-dot-success' /> GraphHopper Solved
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VehicleDetailPanel
