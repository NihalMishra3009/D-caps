/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React, { useEffect, useState } from 'react'
import * as polyline from '@mapbox/polyline'
import { Container, Header, SpaceBetween, SegmentedControl } from '@cloudscape-design/components'
import { Interactive3DMap, type MapMarkerItem } from './Interactive3DMap'
import { MapContainer, TileLayer, Marker, Popup, Polyline as LeafletPolyline, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import ReactMarkdown from 'react-markdown'
import 'leaflet/dist/leaflet.css'
import { appvars } from '../../config'

export type MapInputProps = {
  orders?: any[]
  geofences?: any[]
  warehouses?: any[]
  customers?: any[]
}

const { MAP_VARS } = appvars

// Leaflet fallback icons
const createCustomIcon = (iconType: 'house' | 'person' | 'face' | 'restaurant', color: string) => {
  let svgInner = ''
  if (iconType === 'house') {
    svgInner = '<path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />'
  } else if (iconType === 'face') {
    svgInner = '<circle cx="12" cy="12" r="10" /><circle cx="9" cy="10" r="1.2" fill="#fff" /><circle cx="15" cy="10" r="1.2" fill="#fff" /><path d="M8 15c1.2 1.5 2.6 2 4 2s2.8-.5 4-2" stroke="#fff" stroke-width="1.5" fill="none" />'
  } else if (iconType === 'restaurant') {
    svgInner = '<path d="M8 2v9H6V2H4v20h2v-9h2v9h2V2H8zm9 0c-2 0-4 2-4 6 0 3 2 5 4 5v9h2V13c2 0 4-2 4-5 0-4-2-6-4-6h-2z" />'
  } else {
    svgInner = '<path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 10c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />'
  }

  const svgHtml = `
    <div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.35); border: 2px solid white;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
        ${svgInner}
      </svg>
    </div>
  `

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  })
}

const houseIcon = createCustomIcon('house', '#e53935')
const customerIcon = createCustomIcon('person', '#8e24aa')
const destinationIcon = createCustomIcon('face', '#039be5')
const originIcon = createCustomIcon('restaurant', '#43a047')

const MapViewUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 100)
    return () => clearTimeout(timer)
  }, [center, zoom, map])
  return null
}

const MapComponent: React.FC<MapInputProps> = ({ orders, geofences, warehouses, customers }) => {
  const [mapMode, setMapMode] = useState<string>('3d')
  const [markers3D, setMarkers3D] = useState<MapMarkerItem[]>([])
  const [polylines3D, setPolylines3D] = useState<{ coordinates: [number, number][]; color?: string }[]>([])
  const [leafletPolylines, setLeafletPolylines] = useState<[number, number][][]>([])

  const defaultCenterLat = warehouses?.[0]?.latitude ?? customers?.[0]?.latitude ?? MAP_VARS.DEFAULT_LATITUDE
  const defaultCenterLng = warehouses?.[0]?.longitude ?? customers?.[0]?.longitude ?? MAP_VARS.DEFAULT_LONGITUDE

  // Process data for 3D & 2D maps
  useEffect(() => {
    const list: MapMarkerItem[] = []

    warehouses?.forEach((w, idx) => {
      if (w.latitude && w.longitude) {
        list.push({
          id: `wh-${w.Id || idx}`,
          latitude: Number(w.latitude),
          longitude: Number(w.longitude),
          title: w.warehouseName || `Warehouse ${w.warehouseCode || idx + 1}`,
          subtitle: w.address || 'Central Fulfillment & Dispatch Hub',
          type: 'warehouse',
          data: w,
        })
      }
    })

    customers?.forEach((c, idx) => {
      if (c.latitude && c.longitude) {
        list.push({
          id: `cust-${c.Id || idx}`,
          latitude: Number(c.latitude),
          longitude: Number(c.longitude),
          title: c.deliveryName || `Medical Center ${c.deliveryCode || idx + 1}`,
          subtitle: c.address || 'Hospital & Diagnostic Delivery Point',
          type: 'customer',
          data: c,
        })
      }
    })

    if (orders) {
      orders.forEach((q: any) => {
        const segments = q.detail?.segments ?? []
        segments.forEach((s: any, sIdx: number) => {
          if (s.segmentType === 'TO_DESTINATION' && s.to?.lat && s.to?.long) {
            list.push({
              id: `dest-${sIdx}-${s.deliveryCode || ''}`,
              latitude: Number(s.to.lat),
              longitude: Number(s.to.long),
              title: s.deliveryName || 'Destination Point',
              subtitle: `Demands: ${s.demands || 'N/A'}`,
              type: 'destination',
              data: s,
            })
          }
        })
      })
    }

    setMarkers3D(list)

    // Decode Polylines
    const polyList3D: { coordinates: [number, number][]; color?: string }[] = []
    const polyList2D: [number, number][][] = []

    if (orders) {
      orders.forEach((q: any, idx: number) => {
        if (q.detail?.route?.pointsEncoded) {
          try {
            const decoded = polyline.decode(q.detail.route.pointsEncoded)
            if (decoded && decoded.length) {
              polyList2D.push(decoded.map(([lat, lng]) => [lat, lng]))
              // MapLibre uses [lng, lat] format
              polyList3D.push({
                coordinates: decoded.map(([lat, lng]) => [lng, lat]),
                color: idx % 2 === 0 ? '#38bdf8' : '#34d399',
              })
            }
          } catch (e) {
            console.error('Error decoding polyline', e)
          }
        }
      })
    }

    setLeafletPolylines(polyList2D)
    setPolylines3D(polyList3D)
  }, [orders, warehouses, customers])

  return (
    <Container
      header={
        <Header
          variant='h2'
          actions={
            <SpaceBetween size='s' direction='horizontal'>
              <SegmentedControl
                selectedId={mapMode}
                onChange={({ detail }) => setMapMode(detail.selectedId)}
                options={[
                  { id: '3d', text: '3D Tactical (Three.js & MapLibre)' },
                  { id: '2d', text: '2D OpenStreetMap' },
                ]}
              />
            </SpaceBetween>
          }
        >
          Navi Mumbai Logistics Network Map
        </Header>
      }
    >
      {mapMode === '3d' ? (
        <Interactive3DMap
          markers={markers3D}
          polylines={polylines3D}
          center={[defaultCenterLng, defaultCenterLat]}
          zoom={13.5}
          pitch={56}
          bearing={-18}
          height={750}
          title='MMR Tactical Medical Logistics 3D Map'
          subtitle='Real-time 3D vector extrusions & WebGL coordinate beacon projection'
        />
      ) : (
        <div style={{ width: '100%', height: 750, borderRadius: 12, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
          <MapContainer
            center={[defaultCenterLat, defaultCenterLng]}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={true}
          >
            <MapViewUpdater center={[defaultCenterLat, defaultCenterLng]} zoom={12} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />

            {warehouses?.map((r: any, idx: number) => (
              <Marker key={`warehouse-${idx}`} position={[r.latitude, r.longitude]} icon={houseIcon}>
                <Popup>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#e53935' }}>Warehouse Hub</h4>
                    <div style={{ maxWidth: 350, maxHeight: 220, overflow: 'auto' }}>
                      <ReactMarkdown>{`\`\`\`json\n${JSON.stringify(r, null, 2)}\n\`\`\``}</ReactMarkdown>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {customers?.map((r: any, idx: number) => (
              <Marker key={`customer-${idx}`} position={[r.latitude, r.longitude]} icon={customerIcon}>
                <Popup>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#8e24aa' }}>Customer / Hospital</h4>
                    <div style={{ maxWidth: 350, maxHeight: 220, overflow: 'auto' }}>
                      <ReactMarkdown>{`\`\`\`json\n${JSON.stringify(r, null, 2)}\n\`\`\``}</ReactMarkdown>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {leafletPolylines.map((positions, idx) => (
              <LeafletPolyline
                key={`route-${idx}`}
                positions={positions}
                pathOptions={{
                  color: idx % 2 === 0 ? '#1976d2' : '#388e3c',
                  weight: 5,
                  opacity: 0.85,
                }}
              />
            ))}

            {geofences?.map((g: any, idx: number) => (
              <Circle
                key={`geofence-${idx}`}
                center={[g.detail.lat, g.detail.long]}
                radius={g.detail.radius || 1000}
                pathOptions={{
                  color: '#0288d1',
                  fillColor: '#29b6f6',
                  fillOpacity: 0.2,
                }}
              />
            ))}
          </MapContainer>
        </div>
      )}
    </Container>
  )
}

export default MapComponent
