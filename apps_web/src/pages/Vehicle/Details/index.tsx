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

// Interface for canonical checkpoint structure
export interface CheckpointItem {
  id: string
  sequence: number
  name: string
  address: string
  latitude: number
  longitude: number
  type: 'warehouse' | 'destination'
  status?: string
  orderNo?: string
  weightKg?: number
  subtitle?: string
}

// Canonical Geographic Coordinates for all Navi Mumbai Checkpoints & Depots
export const LOCATION_COORDINATES_MAP: Record<
  string,
  { lat: number; lng: number; name: string; address: string }
> = {
  // Depots
  '95001200': {
    lat: 19.06740,
    lng: 73.02043,
    name: 'Navi Mumbai Central Medical Distribution Hub',
    address: 'MIDC Industrial Area, Turbhe, Navi Mumbai',
  },
  '95001300': {
    lat: 19.0771,
    lng: 72.9986,
    name: 'Vashi Medical Cold-Chain Depot',
    address: 'Sector 19, APMC Complex, Vashi, Navi Mumbai',
  },
  '95001400': {
    lat: 18.9894,
    lng: 73.1175,
    name: 'Panvel Express Logistics Hub',
    address: 'Old Mumbai-Pune Highway, Panvel, Navi Mumbai',
  },

  // Vehicle MH-46-OWN-101 Assigned Medical Checkpoints
  '10000010': {
    lat: 19.08354,
    lng: 72.99902,
    name: 'Fortis Hiranandani Hospital',
    address: 'Sector 10A, Mini Sea Shore Rd, Vashi, Navi Mumbai',
  },
  '10000020': {
    lat: 19.00600,
    lng: 73.01762,
    name: 'Apollo Hospitals Navi Mumbai',
    address: 'Plot # 13, Parsik Hill Rd, Sector 23, CBD Belapur, Navi Mumbai',
  },
  '10000030': {
    lat: 19.03509,
    lng: 73.08192,
    name: 'MGM Hospital & Research Centre',
    address: 'Sector 3, Vashi / Belapur, Navi Mumbai',
  },

  // Vehicle MH-46-OWN-102 Assigned Medical Checkpoints
  '10000040': {
    lat: 19.0965,
    lng: 73.01234,
    name: 'Dhirubhai Ambani Life Science Centre',
    address: 'Thane-Belapur Road, Kopar Khairane, Navi Mumbai',
  },
  '10000050': {
    lat: 19.04349,
    lng: 73.06455,
    name: 'Tata ACTREC Cancer Research Centre',
    address: 'Sector 22, Kharghar, Navi Mumbai',
  },
  '10000060': {
    lat: 19.04133,
    lng: 73.02262,
    name: 'Terna Speciality Hospital & Research',
    address: 'Sector 22, Phase II, Nerul West, Navi Mumbai',
  },

  // Vehicle MH-46-OWN-103 Assigned Medical Checkpoints
  '10000070': {
    lat: 19.0185,
    lng: 73.0285,
    name: 'Seawoods Advanced Diagnostics Institute',
    address: 'Sector 40, Seawoods West, Navi Mumbai',
  },
  '10000080': {
    lat: 19.04851,
    lng: 73.07144,
    name: 'Motherhood Hospital Kharghar',
    address: 'Sector 7, Kharghar, Navi Mumbai',
  },
  '10000090': {
    lat: 19.07268,
    lng: 73.08154,
    name: 'Lifeline Multispeciality Hospital',
    address: 'Sector 36, Kamothe, Navi Mumbai',
  },

  // Vehicle MH-46-OWN-104 Assigned Medical Checkpoints
  '10000100': {
    lat: 18.9895,
    lng: 73.1185,
    name: 'Panvel Advanced Trauma Care Centre',
    address: 'Near Orion Mall, Panvel, Navi Mumbai',
  },
  '10000110': {
    lat: 19.0625,
    lng: 73.00848,
    name: 'Indravati Hospital & Research Centre',
    address: 'Sector 3, Airoli, Navi Mumbai',
  },
  '10000120': {
    lat: 19.08153,
    lng: 73.00346,
    name: 'Surya Diagnostic & Healthcare Clinic',
    address: 'Sector 8, Ghansoli, Navi Mumbai',
  },

  // Vehicle MH-46-OWN-105 Assigned Medical Checkpoints
  '10000130': {
    lat: 19.0325,
    lng: 73.01455,
    name: 'Millennium Care Diagnostic Hub',
    address: 'Sector 4, Sanpada, Navi Mumbai',
  },
  '10000140': {
    lat: 19.05651,
    lng: 73.01892,
    name: 'Juinagar Community Healthcare Centre',
    address: 'Sector 23, Juinagar East, Navi Mumbai',
  },
  '10000150': {
    lat: 19.03045,
    lng: 73.10408,
    name: 'Metro Hospital & Emergency Centre',
    address: 'Sector 1E, Kalamboli, Navi Mumbai',
  },
  '10000160': {
    lat: 19.1362,
    lng: 73.0075,
    name: 'Rabale Industrial Health Clinic',
    address: 'Sector 8, MIDC Rabale, Navi Mumbai',
  },
}

// Default Vehicle Assigned Stops Mapping
const VEHICLE_DEFAULT_STOPS_MAP: Record<
  string,
  Array<{ code: string; status: 'Complete' | 'On Delivery' | 'Scheduled' | 'Pending'; weightKg: number; subtitle: string }>
> = {
  'MH-46-OWN-101': [
    { code: '10000010', status: 'On Delivery', weightKg: 500, subtitle: 'Emergency • On Delivery' },
    { code: '10000020', status: 'Scheduled', weightKg: 620, subtitle: 'Scheduled' },
    { code: '10000030', status: 'Scheduled', weightKg: 480, subtitle: 'Scheduled' },
  ],
  'MH-46-OWN-102': [
    { code: '10000040', status: 'On Delivery', weightKg: 750, subtitle: 'Emergency • On Delivery' },
    { code: '10000050', status: 'Scheduled', weightKg: 850, subtitle: 'Scheduled' },
    { code: '10000060', status: 'Scheduled', weightKg: 600, subtitle: 'Scheduled' },
  ],
  'MH-46-OWN-103': [
    { code: '10000070', status: 'On Delivery', weightKg: 410, subtitle: 'Emergency • On Delivery' },
    { code: '10000080', status: 'Scheduled', weightKg: 530, subtitle: 'Scheduled' },
    { code: '10000090', status: 'Scheduled', weightKg: 1100, subtitle: 'Scheduled' },
  ],
  'MH-46-OWN-104': [
    { code: '10000100', status: 'On Delivery', weightKg: 1400, subtitle: 'Emergency • On Delivery' },
    { code: '10000110', status: 'Scheduled', weightKg: 850, subtitle: 'Scheduled' },
    { code: '10000120', status: 'Scheduled', weightKg: 720, subtitle: 'Scheduled' },
  ],
  'MH-46-OWN-105': [
    { code: '10000130', status: 'On Delivery', weightKg: 640, subtitle: 'Emergency • On Delivery' },
    { code: '10000140', status: 'Scheduled', weightKg: 580, subtitle: 'Scheduled' },
    { code: '10000150', status: 'Scheduled', weightKg: 920, subtitle: 'Scheduled' },
  ],
}

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
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

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

  // Single Source of Truth: Canonical Checkpoints Array
  const checkpoints: CheckpointItem[] = useMemo(() => {
    const depotCode = currentItem?.warehouseCode || '95001200'
    const depotInfo = LOCATION_COORDINATES_MAP[depotCode] || {
      lat: 19.06740,
      lng: 73.02043,
      name: 'Navi Mumbai Central Medical Distribution Hub',
      address: 'MIDC Industrial Area, Turbhe, Navi Mumbai',
    }

    const list: CheckpointItem[] = [
      {
        id: depotCode,
        sequence: 0,
        name: depotInfo.name,
        address: depotInfo.address,
        latitude: depotInfo.lat,
        longitude: depotInfo.lng,
        type: 'warehouse',
        subtitle: 'Depot Hub (Origin & Return)',
      },
    ]

    const carNo = currentItem?.carNo || 'MH-46-OWN-101'

    if (matchedJob && Array.isArray(matchedJob.segments) && matchedJob.segments.length > 1) {
      const stopSegments = matchedJob.segments.filter(
        (s: any) =>
          s.deliveryCode &&
          s.deliveryCode !== 'WAREHOUSE' &&
          s.deliveryCode !== matchedJob.warehouseCode &&
          s.deliveryCode !== depotCode
      )

      stopSegments.forEach((s: any, idx: number) => {
        const code = String(s.deliveryCode)
        const mapped = LOCATION_COORDINATES_MAP[code]
        const lat = Number(mapped?.lat ?? s.latitude ?? s.from?.latitude ?? s.from?.lat ?? 19.076)
        const lng = Number(mapped?.lng ?? s.longitude ?? s.from?.longitude ?? s.from?.long ?? 73.003)

        list.push({
          id: code,
          sequence: idx + 1,
          name: mapped?.name || s.deliveryName || `Hospital ${code}`,
          address: mapped?.address || s.address || 'Navi Mumbai',
          latitude: lat,
          longitude: lng,
          type: 'destination',
          orderNo: code,
          status: idx === 0 ? 'On Delivery' : idx === stopSegments.length - 1 ? 'Complete' : 'Scheduled',
          weightKg: Number(s.demands || 500),
          subtitle: idx === 0 ? 'Emergency • On Delivery' : `Consignment #${code}`,
        })
      })
    } else {
      const defaultStops = VEHICLE_DEFAULT_STOPS_MAP[carNo] || VEHICLE_DEFAULT_STOPS_MAP['MH-46-OWN-101']
      defaultStops.forEach((st, idx) => {
        const mapped = LOCATION_COORDINATES_MAP[st.code]
        list.push({
          id: st.code,
          sequence: idx + 1,
          name: mapped?.name || `Hospital ${st.code}`,
          address: mapped?.address || 'Navi Mumbai',
          latitude: mapped?.lat ?? 19.076,
          longitude: mapped?.lng ?? 73.003,
          type: 'destination',
          orderNo: st.code,
          status: st.status,
          weightKg: st.weightKg,
          subtitle: st.subtitle,
        })
      })
    }

    // Preserve checkpoint sequence strictly
    list.sort((a, b) => a.sequence - b.sequence)
    return list
  }, [currentItem, matchedJob])

  // Debugging requirement: console.table of checkpoints
  useEffect(() => {
    if (checkpoints && checkpoints.length > 0) {
      console.table(
        checkpoints.map((point) => ({
          id: point.id,
          sequence: point.sequence,
          name: point.name,
          latitude: point.latitude,
          longitude: point.longitude,
        }))
      )
    }
  }, [checkpoints])

  const maxCapacity = Number(currentItem?.maxWeight || 20000)
  const currentLoad = matchedJob ? Number(matchedJob.loadCapacity || 18400) : 18400
  const remainingCapacity = Math.max(0, maxCapacity - currentLoad)
  const utilPct = maxCapacity > 0 ? Math.round((currentLoad / maxCapacity) * 100) : 82
  const assignedDropsCount = checkpoints.filter((c) => c.sequence > 0).length
  const timeGroup = matchedJob?.deliveryTimeGroup || '01'
  const isInactive = currentItem ? currentItem.carNo.includes('99') || currentItem.carNo.includes('INA') : false

  // Assigned Orders List derived directly from canonical checkpoints
  const assignedOrders: FleetOrderItem[] = useMemo(() => {
    return checkpoints
      .filter((cp) => cp.sequence > 0)
      .map((cp) => ({
        id: cp.id,
        orderNo: cp.orderNo || cp.id,
        customerName: cp.name,
        locationAddress: cp.address,
        weightKg: cp.weightKg || 500,
        status: (cp.status as any) || 'Scheduled',
        latitude: cp.latitude,
        longitude: cp.longitude,
      }))
  }, [checkpoints])

  // Map Markers derived directly from canonical checkpoints
  const mapMarkers: MapMarkerItem[] = useMemo(() => {
    return checkpoints.map((cp) => ({
      id: cp.id,
      latitude: cp.latitude,
      longitude: cp.longitude,
      title: cp.name,
      subtitle: cp.subtitle || cp.address,
      sequence: cp.sequence,
      type: cp.type,
      data: cp,
    }))
  }, [checkpoints])

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

    // 3. Fallback: connect checkpoints directly from depot -> stop 1 -> stop 2 -> stop 3 -> depot
    if (checkpoints && checkpoints.length >= 2) {
      const pts: [number, number][] = checkpoints.map((cp) => [cp.longitude, cp.latitude])
      // Return to origin depot
      pts.push([checkpoints[0].longitude, checkpoints[0].latitude])
      return pts
    }

    return []
  }, [matchedJob, currentItem, checkpoints])

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
                selectedMarkerId={selectedOrderId}
                onSelectMarker={(m) => setSelectedOrderId(String(m.id))}
              />
            ) : (
              <Interactive3DMap
                markers={mapMarkers}
                polylines={mapPolylines}
                selectedMarkerId={selectedOrderId}
                onSelectMarker={(m) => setSelectedOrderId(String(m.id))}
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

        {/* Right: Assigned Orders */}
        <div>
          <FleetOrderList
            orders={assignedOrders}
            selectedOrderId={selectedOrderId}
            onSelectOrder={(ord) => setSelectedOrderId(ord.id)}
            title={`ASSIGNED ORDERS (${assignedOrders.length})`}
          />
        </div>
      </div>
    </div>
  )
}

export default Details
