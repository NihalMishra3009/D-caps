/**
 * Logistics Editorial Landing Page (aws_design.md Section 6, 8, 9)
 * Clean editorial composition:
 * - Hero: MOVE & OPTIMIZE + Primary CTAs + Dominant Truck Visual Canvas
 * - Capability Strip: 17 Customer Locations | 8 Fleet Vehicles | VRPTW Optimization | 3D Visualization
 * - Product Overview: Fleet | Dispatch | Route Intelligence
 * - 3D Route Intelligence Showcase
 */

import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import * as polyline from '@mapbox/polyline'
import { appvars } from '../../config'
import Common from '../../api/Common'
import NextDayDelivery from '../../api/NextDayDelivery'
import Interactive3DMap, { type MapMarkerItem } from '../../components/MapComponent/Interactive3DMap'
import TruckGraphic from '../../components/fleet/TruckGraphic'
import {
  ArrowRight,
  Truck,
  Sparkles,
  Layers,
  MapPin,
  Clock,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'

const VEHICLE_COLORS = [
  '#38bdf8', // Light blue
  '#34d399', // Emerald green
  '#c084fc', // Purple
  '#facc15', // Amber / Yellow
  '#f87171', // Red / Coral
  '#fb923c', // Orange
  '#e879f9', // Pink
  '#2dd4bf', // Teal
]

const extractRouteCoordinates = (job: any): [number, number][] => {
  if (job?.route?.pointsEncoded) {
    try {
      const decoded = polyline.decode(job.route.pointsEncoded)
      if (decoded && decoded.length >= 2) {
        return decoded.map(([lat, lng]) => [lng, lat])
      }
    } catch (e) {
      console.warn('Failed to decode top-level route polyline', e)
    }
  }

  if (Array.isArray(job?.segments) && job.segments.length > 0) {
    const points: [number, number][] = []
    job.segments.forEach((seg: any) => {
      if (seg?.route?.pointsEncoded) {
        try {
          const segDecoded = polyline.decode(seg.route.pointsEncoded)
          segDecoded.forEach(([lat, lng]) => {
            if (!isNaN(lat) && !isNaN(lng)) {
              points.push([lng, lat])
            }
          })
        } catch (e) {
          console.warn('Failed to decode segment polyline', e)
        }
      }
    })
    if (points.length >= 2) {
      return points
    }
  }

  return []
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [markers, setMarkers] = useState<MapMarkerItem[]>([])
  const [polylines, setPolylines] = useState<{ coordinates: [number, number][]; color?: string; id?: string }[]>([])

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        const [custRes, whRes, jobRes] = await Promise.allSettled([
          Common.commonGetRequest(appvars.URL.CUSTOMER_LOCATION),
          Common.commonGetRequest(appvars.URL.WAREHOUSE),
          NextDayDelivery.getDeliveryJobsAll(),
        ])

        const list: MapMarkerItem[] = []

        if (whRes.status === 'fulfilled' && whRes.value?.data?.Items) {
          whRes.value.data.Items.forEach((w: any, idx: number) => {
            if (w.latitude && w.longitude) {
              list.push({
                id: `wh-${w.Id || idx}`,
                latitude: Number(w.latitude),
                longitude: Number(w.longitude),
                title: w.warehouseName || `Warehouse ${w.warehouseCode}`,
                subtitle: w.address || 'Central Distribution Hub',
                type: 'warehouse',
              })
            }
          })
        }

        if (custRes.status === 'fulfilled' && custRes.value?.data?.Items) {
          custRes.value.data.Items.forEach((c: any, idx: number) => {
            if (c.latitude && c.longitude) {
              list.push({
                id: `cust-${c.Id || idx}`,
                latitude: Number(c.latitude),
                longitude: Number(c.longitude),
                title: c.deliveryName || `Hospital ${c.deliveryCode}`,
                subtitle: c.address || 'Hospital / Clinic Location',
                type: 'customer',
              })
            }
          })
        }

        const polyList: { coordinates: [number, number][]; color?: string; id?: string }[] = []
        if (jobRes.status === 'fulfilled' && jobRes.value?.data?.Items) {
          jobRes.value.data.Items.forEach((j: any, idx: number) => {
            const coords = extractRouteCoordinates(j)
            if (coords.length >= 2) {
              polyList.push({
                id: `dashboard-route-${j.carNo || j.Id || idx}`,
                coordinates: coords,
                color: VEHICLE_COLORS[idx % VEHICLE_COLORS.length],
              })
            }
          })
        }

        setMarkers(list)
        setPolylines(polyList)
      } catch (e) {
        console.error('Error fetching home map markers and delivery routes', e)
      }
    }

    loadOverviewData()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48, paddingTop: 16 }}>
      {/* =========================================================
          1. HERO SECTION (Editorial Logistics Composition)
         ========================================================= */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '48px 40px 36px',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 40,
            alignItems: 'center',
          }}
        >
          {/* Left Text Column */}
          <div style={{ maxWidth: 540 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--bg-surface-muted)',
                border: '1px solid var(--border)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginBottom: 20,
              }}
            >
              <Sparkles size={12} color='var(--accent-purple)' />
              <span>MOVE & OPTIMIZE</span>
            </div>

            <h1 className='heading-hero' style={{ marginBottom: 16 }}>
              Smarter dispatch. <br />
              <span style={{ color: 'var(--accent-purple)' }}>Better fleet utilization.</span>
            </h1>

            <p
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                marginBottom: 28,
              }}
            >
              Plan routes, manage vehicle capacities, and monitor next-day medical supply deliveries across Navi Mumbai from one unified command center.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(`/${appvars.URL.SOLVER_JOB}`)}
                className='btn btn-primary btn-lg'
              >
                <span>Open Command Center</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => navigate(`/${appvars.URL.VEHICLE}`)}
                className='btn btn-secondary btn-lg'
              >
                <span>Explore Fleet</span>
              </button>
            </div>
          </div>

          {/* Right Visual Column (Dominant Truck Visual Canvas with Telemetry Callouts) */}
          <div
            style={{
              position: 'relative',
              backgroundColor: 'var(--bg-surface-muted)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '32px 16px 20px',
              minHeight: 320,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Top Telemetry Tag */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: 18,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span className='status-dot status-dot-success' />
              <span>Fleet Status: 84% Utilized</span>
            </div>

            {/* Bottom Route Vector Tag */}
            <div
              style={{
                position: 'absolute',
                bottom: 14,
                right: 18,
                backgroundColor: 'var(--accent-dark)',
                color: '#ffffff',
                borderRadius: 'var(--radius-sm)',
                padding: '5px 12px',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span>VRPTW Road Optimized • 58.4 km</span>
            </div>

            <TruckGraphic accentColor='var(--accent-purple)' />
          </div>
        </div>
      </section>

      {/* =========================================================
          2. OPERATIONAL CAPABILITY STRIP (aws_design.md Section 9.2)
         ========================================================= */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <div className='card' style={{ padding: '20px 24px' }}>
          <div className='text-value-kpi'>17</div>
          <div className='text-label' style={{ marginTop: 4 }}>
            CUSTOMER LOCATIONS
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Navi Mumbai Hospitals & Clinics
          </div>
        </div>

        <div className='card' style={{ padding: '20px 24px' }}>
          <div className='text-value-kpi'>8</div>
          <div className='text-label' style={{ marginTop: 4 }}>
            FLEET VEHICLES
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            1T, 2.5T & 5.0T Payload Grades
          </div>
        </div>

        <div className='card' style={{ padding: '20px 24px' }}>
          <div className='text-value-kpi' style={{ color: 'var(--accent-purple)' }}>
            VRPTW
          </div>
          <div className='text-label' style={{ marginTop: 4 }}>
            ROUTE OPTIMIZATION
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            OptaPlanner Constraint Balancing
          </div>
        </div>

        <div className='card' style={{ padding: '20px 24px' }}>
          <div className='text-value-kpi' style={{ color: '#598f1a' }}>
            3D
          </div>
          <div className='text-label' style={{ marginTop: 4 }}>
            LIVE ROUTE VISUALIZATION
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            MapLibre GL Extruded Buildings
          </div>
        </div>
      </section>

      {/* =========================================================
          3. PRODUCT OVERVIEW CARDS (aws_design.md Section 9.3)
         ========================================================= */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}
      >
        <div
          className='card'
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform var(--transition-fast)',
          }}
        >
          <div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-purple-light)',
                color: 'var(--accent-purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Truck size={18} />
            </div>
            <h3 className='heading-section' style={{ marginBottom: 8 }}>
              Fleet Operations
            </h3>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              Manage vehicle registrations, capacity envelopes, real-time load utilization, and stop assignments directly on physical vehicle models.
            </p>
          </div>
          <div style={{ marginTop: 20 }}>
            <Link
              to={`/${appvars.URL.VEHICLE}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--accent-purple)',
                textDecoration: 'none',
              }}
            >
              <span>Manage Fleet</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div
          className='card'
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-muted)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Layers size={18} />
            </div>
            <h3 className='heading-section' style={{ marginBottom: 8 }}>
              Dispatch & Consignments
            </h3>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              Inspect hospital delivery consignments, time-window alignments, origin depot schedules, and package weights.
            </p>
          </div>
          <div style={{ marginTop: 20 }}>
            <Link
              to={`/${appvars.URL.ORDER}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
                textDecoration: 'none',
              }}
            >
              <span>View Consignments</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div
          className='card'
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--status-info-bg)',
                color: 'var(--status-info)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <TrendingUp size={18} />
            </div>
            <h3 className='heading-section' style={{ marginBottom: 8 }}>
              Route Intelligence
            </h3>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              Inspect GraphHopper road networks, distance reductions against unoptimized baseline round-trips, and solver score constraints.
            </p>
          </div>
          <div style={{ marginTop: 20 }}>
            <Link
              to={`/${appvars.URL.SOLVER_JOB}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
                textDecoration: 'none',
              }}
            >
              <span>Launch Solver</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. 3D ROUTE INTELLIGENCE SHOWCASE (aws_design.md Section 9.4)
         ========================================================= */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: 24,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
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
          <div>
            <div className='text-label' style={{ marginBottom: 2 }}>
              ROUTE INTELLIGENCE
            </div>
            <h2 className='heading-section'>Optimized movement across the metropolitan delivery network</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className='status-dot status-dot-success' />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Live GraphHopper Topology Active</span>
          </div>
        </div>

        <Interactive3DMap
          markers={markers}
          polylines={polylines}
          center={[73.0297, 19.033]}
          zoom={12.8}
          pitch={58}
          bearing={-20}
          height={480}
          title='Navi Mumbai Active Fleet & Hub Radar'
          subtitle='3D Building Extrusions & Satellite Base Layer'
        />
      </section>
    </div>
  )
}

export default HomePage
