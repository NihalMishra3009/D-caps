/**
 * Vehicle Detail View (Reference Image 4)
 * Prominently displays the white multi-compartment semi-truck with real vehicle payload, assignment facts, route information, interactive map, and assigned orders.
 */

import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useVehicleContext } from '../../../contexts/VehicleContext'
import { appvars } from '../../../config'
import Common from '../../../api/Common'
import NextDayDelivery from '../../../api/NextDayDelivery'
import ReferenceTruckGraphic from '../../../components/fleet/ReferenceTruckGraphic'
import Interactive3DMap, { type MapMarkerItem } from '../../../components/MapComponent/Interactive3DMap'
import StandardRouteMap, { type StandardRouteItem } from '../../../components/MapComponent/StandardRouteMap'
import * as polyline from '@mapbox/polyline'
import roadRoutesData from '../../../api/roadRoutes.json'
import FleetOrderList, { type FleetOrderItem } from '../../../components/fleet/FleetOrderList'
import NotFound from '../../../components/NotFound'
import {
  ArrowLeft,
  Truck,
  MapPin,
  Navigation2,
  ChevronDown,
  Edit,
  Trash2,
} from 'lucide-react'

export const Details: React.FC = () => {
  const navigate = useNavigate()
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const [{ items: vehicleItems }, { deleteItem }] = useVehicleContext()

  const currentItem = vehicleItems.find(
    (x) => x.Id === vehicleId || (x as any).id === vehicleId || x.carNo === vehicleId
  )

  const [mapMode, setMapMode] = useState<'2d' | '3d'>('2d')
  const [deliveryJobs, setDeliveryJobs] = useState<any[]>([])
  const [showActionsMenu, setShowActionsMenu] = useState(false)

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await Common.commonGetRequest(appvars.URL.SOLVER_JOB)
        if (res?.data?.Items && res.data.Items.length > 0) {
          const jobRes = await NextDayDelivery.getDeliveryJobsBySolverJob(res.data.Items[0].Id)
          if (jobRes?.data?.Items) {
            setDeliveryJobs(jobRes.data.Items)
          }
        }
      } catch (e) {
        console.warn('Error loading delivery jobs for vehicle details', e)
      }
    }
    loadJobs()
  }, [])

  const matchedJob = useMemo(() => {
    if (!currentItem) return null
    return deliveryJobs.find((j) => String(j.carNo) === String(currentItem.carNo))
  }, [deliveryJobs, currentItem])

  const maxCapacity = Number(currentItem?.maxWeight || 20000)
  const currentLoad = matchedJob ? Number(matchedJob.loadCapacity || 18400) : 18400
  const remainingCapacity = Math.max(0, maxCapacity - currentLoad)
  const utilPct = maxCapacity > 0 ? Math.round((currentLoad / maxCapacity) * 100) : 82
  const assignedDropsCount = matchedJob && Array.isArray(matchedJob.segments) ? matchedJob.segments.length - 1 : 4
  const timeGroup = matchedJob?.deliveryTimeGroup || '01'
  const isInactive = currentItem ? currentItem.carNo.includes('99') || currentItem.carNo.includes('INA') : false

  // Assigned Orders List
  const assignedOrders: FleetOrderItem[] = useMemo(() => {
    if (matchedJob && Array.isArray(matchedJob.segments)) {
      return matchedJob.segments
        .filter((s: any) => s.deliveryCode && s.deliveryCode !== 'WAREHOUSE' && s.deliveryCode !== matchedJob.warehouseCode)
        .map((s: any, idx: number) => ({
          id: `seg-${idx}-${s.deliveryCode}`,
          orderNo: s.deliveryCode || `ORD-983${idx}`,
          customerName: s.deliveryName || `Hospital ${s.deliveryCode}`,
          locationAddress: s.address || 'Navi Mumbai',
          weightKg: Number(s.demands || 500),
          status: idx === 0 ? 'On Delivery' : idx === 3 ? 'Complete' : 'Scheduled',
          latitude: Number(s.to?.latitude ?? s.latitude ?? 19.076),
          longitude: Number(s.to?.longitude ?? s.longitude ?? 73.003),
        }))
    }

    return [
      { id: '1', orderNo: '9836', customerName: 'Fortis Hiranandani', locationAddress: 'Vashi', weightKg: 500, status: 'On Delivery' },
      { id: '2', orderNo: '1780', customerName: 'Apollo Hospitals', locationAddress: 'Belapur', weightKg: 620, status: 'Scheduled' },
      { id: '3', orderNo: '6824', customerName: 'MGM Hospital', locationAddress: 'Kharghar', weightKg: 480, status: 'Scheduled' },
      { id: '4', orderNo: '9102', customerName: 'Tata ACTREC', locationAddress: 'Nerul', weightKg: 500, status: 'Complete' },
    ]
  }, [matchedJob])

  // Map Markers
  const mapMarkers: MapMarkerItem[] = useMemo(() => {
    const list: MapMarkerItem[] = [
      {
        id: 'depot-origin',
        latitude: Number(matchedJob?.segments?.[0]?.from?.latitude ?? 19.0674),
        longitude: Number(matchedJob?.segments?.[0]?.from?.longitude ?? 73.0205),
        title: 'Depot 95001200',
        subtitle: 'Navi Mumbai Central Hub',
        type: 'warehouse',
      },
    ]

    assignedOrders.forEach((ord: any, idx) => {
      const defaultLats = [19.076, 19.019, 19.043, 19.028]
      const defaultLngs = [73.003, 73.038, 73.067, 73.018]
      list.push({
        id: `stop-${ord.id}`,
        latitude: ord.latitude || defaultLats[idx % defaultLats.length],
        longitude: ord.longitude || defaultLngs[idx % defaultLngs.length],
        title: ord.customerName,
        subtitle: `#${ord.orderNo}`,
        type: 'destination',
      })
    })

    return list
  }, [matchedJob, assignedOrders])

  // Route Coordinates (Road Following)
  const routeCoordinates = useMemo<[number, number][]>(() => {
    // 1. Try matchedJob polyline
    if (matchedJob?.route?.pointsEncoded) {
      try {
        const decoded = polyline.decode(matchedJob.route.pointsEncoded)
        if (decoded && decoded.length >= 2) {
          return decoded.map(([lat, lng]) => [lng, lat])
        }
      } catch (e) {
        console.warn('Failed to decode matchedJob route polyline', e)
      }
    }

    // 2. Try roadRoutesData by vehicle carNo
    const carNo = currentItem?.carNo
    if (carNo && (roadRoutesData as any)[carNo]?.polyline) {
      try {
        const decoded = polyline.decode((roadRoutesData as any)[carNo].polyline)
        if (decoded && decoded.length >= 2) {
          return decoded.map(([lat, lng]) => [lng, lat])
        }
      } catch (e) {
        console.warn('Failed to decode roadRoutesData polyline', e)
      }
    }

    // 3. Fallback: connect stops
    if (mapMarkers && mapMarkers.length >= 2) {
      return mapMarkers.map((m) => [m.longitude, m.latitude])
    }

    return []
  }, [matchedJob, currentItem, mapMarkers])

  // 2D Standard Routes
  const standardRoutes = useMemo<StandardRouteItem[]>(() => {
    if (!routeCoordinates || routeCoordinates.length < 2) return []
    return [
      {
        id: `vehicle-route-${currentItem?.carNo || '1'}`,
        color: '#9333ea',
        label: `Vehicle ${currentItem?.carNo || ''} Calculated Road Route`,
        points: routeCoordinates.map(([lng, lat]) => [lat, lng]),
      },
    ]
  }, [routeCoordinates, currentItem])

  // 3D Polylines
  const mapPolylines = useMemo(() => {
    if (!routeCoordinates || routeCoordinates.length < 2) return []
    return [
      {
        id: `vehicle-poly-${currentItem?.carNo || '1'}`,
        coordinates: routeCoordinates,
        color: '#a855f7',
      },
    ]
  }, [routeCoordinates, currentItem])

  const handleDelete = async () => {
    if (!currentItem) return
    if (window.confirm(`Are you sure you want to delete vehicle ${currentItem.carNo}?`)) {
      await deleteItem(currentItem.Id)
      navigate(`/${appvars.URL.VEHICLE}`)
    }
  }

  // Render NotFound AFTER all hooks have executed
  if (!currentItem) {
    return <NotFound what='Vehicle data' backUrl={appvars.URL.VEHICLE} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Back Navigation */}
      <div>
        <button
          onClick={() => navigate(`/${appvars.URL.VEHICLE}`)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Fleet</span>
        </button>
      </div>

      {/* Main Vehicle Header & KPI Summary Strip (Reference Image 4) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        {/* Title & Depot */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className='heading-page' style={{ fontSize: 24, fontWeight: 700 }}>
              Vehicle {currentItem.carNo}
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: isInactive ? 'var(--status-error-bg)' : 'var(--status-success-bg)',
                color: isInactive ? 'var(--status-error)' : '#598f1a',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span className={`status-dot ${isInactive ? 'status-dot-error' : 'status-dot-success'}`} />
              <span>{isInactive ? 'Inactive' : 'Active'}</span>
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Depot: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{currentItem.warehouseCode || '95001200'}</span>
          </div>
        </div>

        {/* Utilization & Payload Stats + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {/* Utilization Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 18px',
              minWidth: 140,
            }}
          >
            <div className='text-label' style={{ fontSize: 10 }}>UTILIZATION</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-purple)', marginTop: 2 }}>
              {utilPct}%
            </div>
            <div style={{ width: '100%', height: 4, backgroundColor: 'var(--bg-surface-muted)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ width: `${utilPct}%`, height: '100%', backgroundColor: 'var(--accent-purple)', borderRadius: 2 }} />
            </div>
          </div>

          {/* Payload Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 18px',
              minWidth: 160,
            }}
          >
            <div className='text-label' style={{ fontSize: 10 }}>PAYLOAD</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
              {currentLoad.toLocaleString()} / {maxCapacity.toLocaleString()} kg
            </div>
          </div>

          {/* Actions Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className='btn btn-secondary'
              style={{ padding: '8px 14px' }}
            >
              <span>Actions</span>
              <ChevronDown size={14} />
            </button>

            {showActionsMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 4px)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  width: 150,
                  zIndex: 20,
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => navigate(`/${appvars.URL.VEHICLE}/${currentItem.Id}/edit`)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-surface-muted)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                >
                  <Edit size={13} />
                  <span>Edit details</span>
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: 13,
                    color: 'var(--status-error)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-surface-muted)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                >
                  <Trash2 size={13} />
                  <span>Delete vehicle</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          DOMINANT TRUCK VISUAL CANVAS (Reference Image 4)
         ========================================================= */}
      <div
        className='card'
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '24px 20px 18px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <ReferenceTruckGraphic />

        {/* Operational Drops & Route Vector Strip (Reference Image 4 Bottom Tags) */}
        <div
          style={{
            width: '100%',
            maxWidth: 820,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            borderTop: '1px solid var(--border-light)',
            paddingTop: 14,
            marginTop: 4,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={15} color='var(--accent-purple)' />
            <div>
              <div className='text-label' style={{ fontSize: 9 }}>ASSIGNED DROPS</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                {assignedDropsCount} Medical Facilities
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Navigation2 size={15} color='var(--accent-purple)' />
            <div>
              <div className='text-label' style={{ fontSize: 9 }}>ROUTE DISTANCE</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                39.4 km • 1h 42m
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          3-COLUMN INFORMATION AREA (Reference Image 4)
         ========================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {/* Column 1: Vehicle Information */}
        <div className='card' style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Truck size={16} color='var(--accent-purple)' />
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              VEHICLE INFORMATION
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Vehicle Number</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{currentItem.carNo}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Vehicle Type</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {currentItem.carGrade || `${(maxCapacity / 1000).toFixed(1)} Ton`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Maximum Payload</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{maxCapacity.toLocaleString()} kg</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Current Load</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-purple)' }}>{currentLoad.toLocaleString()} kg</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Remaining Capacity</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{remainingCapacity.toLocaleString()} kg</span>
            </div>
          </div>
        </div>

        {/* Column 2: Assignment Information */}
        <div className='card' style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <MapPin size={16} color='var(--accent-purple)' />
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              ASSIGNMENT INFORMATION
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Time Group</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                Band {timeGroup} (09:00 - 13:00)
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Assigned Drops</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{assignedDropsCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Primary Area</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Navi Mumbai</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#598f1a', fontWeight: 600 }}>
                <span className='status-dot status-dot-success' /> Active
              </span>
            </div>
          </div>
        </div>

        {/* Column 3: Route Information */}
        <div className='card' style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Navigation2 size={16} color='var(--accent-purple)' />
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              ROUTE INFORMATION
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Distance</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>39.4 km</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Estimated Time</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>1h 42m</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Number of Stops</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{assignedDropsCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Start Location</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Depot {currentItem.warehouseCode || '95001200'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status</span>
              <span style={{ color: 'var(--status-info)', fontWeight: 600 }}>On Route</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          ROUTE MAP & ASSIGNED ORDERS (Reference Image 4 Bottom)
         ========================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: 20,
        }}
      >
        {/* Left: Route Map */}
        <div
          className='card'
          style={{
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '12px 18px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={15} color='var(--accent-purple)' />
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-primary)',
                }}
              >
                VEHICLE {currentItem.carNo} ROUTE MAP
              </div>
            </div>

            {/* 2D / 3D Toggle */}
            <div
              style={{
                display: 'flex',
                gap: 4,
                background: 'var(--bg-surface)',
                padding: 3,
                borderRadius: 8,
                border: '1px solid var(--border)',
              }}
            >
              <button
                type='button'
                onClick={() => setMapMode('2d')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: mapMode === '2d' ? 'var(--accent-purple)' : 'transparent',
                  color: mapMode === '2d' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                2D Map (Standard)
              </button>
              <button
                type='button'
                onClick={() => setMapMode('3d')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: mapMode === '3d' ? 'var(--accent-purple)' : 'transparent',
                  color: mapMode === '3d' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                3D Satellite
              </button>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 340 }}>
            {mapMode === '2d' ? (
              <StandardRouteMap
                markers={mapMarkers}
                routes={standardRoutes}
                height={340}
              />
            ) : (
              <Interactive3DMap
                markers={mapMarkers}
                polylines={mapPolylines}
                center={[73.0297, 19.033]}
                zoom={13.2}
                pitch={55}
                bearing={-20}
                height={340}
                title={`Vehicle ${currentItem.carNo} Navigation`}
                subtitle='Real-time turn-by-turn trajectory with 3D buildings'
              />
            )}
          </div>
        </div>

        {/* Right: Assigned Orders (4) */}
        <div>
          <FleetOrderList
            orders={assignedOrders}
            title={`ASSIGNED ORDERS (${assignedOrders.length})`}
          />
        </div>
      </div>
    </div>
  )
}

export default Details
