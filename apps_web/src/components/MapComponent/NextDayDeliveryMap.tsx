/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React, { useEffect, useState } from 'react'
import * as polyline from '@mapbox/polyline'
import { Container, Header, SpaceBetween, SegmentedControl } from '@cloudscape-design/components'
import { Interactive3DMap, type MapMarkerItem } from './Interactive3DMap'
import { MapContainer, TileLayer, Marker, Popup, Polyline as LeafletPolyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import ReactMarkdown from 'react-markdown'
import 'leaflet/dist/leaflet.css'
import { appvars } from '../../config'

export type NextDayDeliveryMapInputProps = {
  segments?: any[]
  route?: any
}

const { MAP_VARS } = appvars

// Depot / Origin Marker (Red House matching reference image)
const createDepotIcon = (name: string) => {
  const safeName = (name || 'Depot Hub').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return L.divIcon({
    html: `
      <div style="display: flex; align-items: center; gap: 6px; pointer-events: auto; white-space: nowrap; transform: translate(-17px, -17px);">
        <div style="background-color: #ef4444; width: 34px; height: 34px; border-radius: 6px; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.35); border: 2px solid white;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
          </svg>
        </div>
        <span style="background: rgba(255,255,255,0.96); padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 13px; color: #0f172a; box-shadow: 0 2px 5px rgba(0,0,0,0.25); border: 1.5px solid #ef4444;">
          ${safeName}
        </span>
      </div>
    `,
    className: 'custom-depot-marker',
    iconSize: [120, 36],
    iconAnchor: [17, 17],
  })
}

// Customer Stop Marker (Purple Pin with person icon matching reference image)
const createCustomerIcon = (name: string, seq?: number) => {
  const safeName = (name || `Stop ${seq || ''}`).replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return L.divIcon({
    html: `
      <div style="display: flex; align-items: center; gap: 6px; pointer-events: auto; white-space: nowrap; transform: translate(-16px, -32px);">
        <div style="background-color: #a855f7; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.35); border: 2px solid white;">
          <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>
        <span style="background: rgba(255,255,255,0.96); padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px; color: #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 1px solid #cbd5e1;">
          ${safeName}
        </span>
      </div>
    `,
    className: 'custom-customer-marker',
    iconSize: [130, 34],
    iconAnchor: [16, 32],
  })
}

// MapViewUpdater automatically fitting bounds to markers and route polyline points
const MapViewUpdater: React.FC<{
  center: [number, number]
  zoom: number
  routePoints: [number, number][]
  markers: { latitude: number; longitude: number }[]
}> = ({ center, zoom, routePoints, markers }) => {
  const map = useMap()

  useEffect(() => {
    const bounds = L.latLngBounds([])

    markers.forEach((m) => {
      if (!isNaN(m.latitude) && !isNaN(m.longitude)) {
        bounds.extend([m.latitude, m.longitude])
      }
    })

    routePoints.forEach(([lat, lng]) => {
      if (!isNaN(lat) && !isNaN(lng)) {
        bounds.extend([lat, lng])
      }
    })

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    } else {
      map.setView(center, zoom)
    }

    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 150)
    return () => clearTimeout(timer)
  }, [center, zoom, routePoints, markers, map])

  return null
}

export const NextDayDeliveryMap: React.FC<NextDayDeliveryMapInputProps> = ({ segments, route }) => {
  // Default to clean 2D OpenStreetMap mode matching user reference
  const [mapMode, setMapMode] = useState<string>('2d')
  const [markers3D, setMarkers3D] = useState<MapMarkerItem[]>([])
  const [polylines3D, setPolylines3D] = useState<{ coordinates: [number, number][]; color?: string; id?: string }[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [leafletRoute, setLeafletRoute] = useState<[number, number][]>([])

  const defaultCenterLat = MAP_VARS.DEFAULT_LATITUDE
  const defaultCenterLng = MAP_VARS.DEFAULT_LONGITUDE

  useEffect(() => {
    if (!segments || segments.length === 0) {
      setMarkers3D([])
      setWarehouses([])
      setCustomers([])
      return
    }

    const mList: MapMarkerItem[] = []
    const whList: any[] = []
    const custList: any[] = []

    if (segments[0]?.from?.lat && segments[0]?.from?.long) {
      const wh = {
        latitude: Number(segments[0].from.lat),
        longitude: Number(segments[0].from.long),
        title: segments[0].deliveryName || 'Dispatch Hub Depot',
      }
      whList.push(wh)
      mList.push({
        id: 'wh-depot',
        latitude: wh.latitude,
        longitude: wh.longitude,
        title: 'Dispatch Hub Depot',
        subtitle: 'Origin Hub Location',
        type: 'warehouse',
      })
    }

    segments.forEach((r: any, idx: number) => {
      if (r.to?.lat && r.to?.long) {
        const cust = {
          deliveryCode: r.deliveryCode,
          deliveryName: r.deliveryName || `Stop #${idx + 1}`,
          deliveryTimeGroup: r.deliveryTimeGroup,
          demands: r.demands,
          latitude: Number(r.to.lat),
          longitude: Number(r.to.long),
        }
        custList.push(cust)
        mList.push({
          id: `cust-${idx}-${r.deliveryCode}`,
          latitude: cust.latitude,
          longitude: cust.longitude,
          title: r.deliveryName || `Stop #${idx + 1}`,
          subtitle: `Time Window: ${r.deliveryTimeGroup || 'Standard'} | Demand: ${r.demands || 1}`,
          type: 'customer',
          data: r,
        })
      }
    })

    setWarehouses(whList)
    setCustomers(custList)
    setMarkers3D(mList)
  }, [segments])

  useEffect(() => {
    // Priority 1: Top-level consolidated route
    if (route && route.pointsEncoded) {
      try {
        const decoded = polyline.decode(route.pointsEncoded)
        if (decoded && decoded.length > 0) {
          setLeafletRoute(decoded.map(([lat, lng]) => [lat, lng]))
          setPolylines3D([
            {
              id: 'vehicle-route-active',
              coordinates: decoded.map(([lat, lng]) => [lng, lat]),
              color: '#9333ea',
            },
          ])
          return
        }
      } catch (e) {
        console.warn('Error decoding top-level route points, trying segment fallback', e)
      }
    }

    // Priority 2: Segment-level route fallback
    if (segments && segments.length > 0) {
      try {
        const allDecodedPoints: [number, number][] = []
        segments.forEach((seg: any) => {
          if (seg.route?.pointsEncoded) {
            const segDecoded = polyline.decode(seg.route.pointsEncoded)
            if (segDecoded && segDecoded.length > 0) {
              segDecoded.forEach(([lat, lng]) => {
                if (!isNaN(lat) && !isNaN(lng)) {
                  allDecodedPoints.push([lat, lng])
                }
              })
            }
          }
        })

        if (allDecodedPoints.length > 0) {
          setLeafletRoute(allDecodedPoints)
          setPolylines3D([
            {
              id: 'vehicle-route-active',
              coordinates: allDecodedPoints.map(([lat, lng]) => [lng, lat]),
              color: '#9333ea',
            },
          ])
          return
        }
      } catch (e) {
        console.warn('Error decoding segment routes', e)
      }

      // Priority 3: Segment waypoint coordinates sequence fallback
      try {
        const waypointPoints: [number, number][] = []
        segments.forEach((seg: any, idx: number) => {
          const fromLat = Number(seg.from?.lat ?? seg.from?.latitude)
          const fromLng = Number(seg.from?.long ?? seg.from?.longitude)
          const toLat = Number(seg.to?.lat ?? seg.to?.latitude)
          const toLng = Number(seg.to?.long ?? seg.to?.longitude)

          if (!isNaN(fromLat) && !isNaN(fromLng) && (waypointPoints.length === 0 || idx === 0)) {
            waypointPoints.push([fromLat, fromLng])
          }
          if (!isNaN(toLat) && !isNaN(toLng)) {
            waypointPoints.push([toLat, toLng])
          }
        })

        if (waypointPoints.length >= 2) {
          setLeafletRoute(waypointPoints)
          setPolylines3D([
            {
              id: 'vehicle-route-active',
              coordinates: waypointPoints.map(([lat, lng]) => [lng, lat]),
              color: '#9333ea',
            },
          ])
          return
        }
      } catch (e) {
        console.warn('Error extracting segment waypoint coordinates', e)
      }
    }

    // Default: Empty route
    setPolylines3D([])
    setLeafletRoute([])
  }, [route, segments])

  const allMapMarkers = [
    ...warehouses.map((w) => ({ latitude: w.latitude, longitude: w.longitude })),
    ...customers.map((c) => ({ latitude: c.latitude, longitude: c.longitude })),
  ]

  return (
    <Container
      header={
        <Header
          variant='h2'
          actions={
            <SpaceBetween size='xs' direction='horizontal'>
              <SegmentedControl
                selectedId={mapMode}
                onChange={({ detail }) => setMapMode(detail.selectedId)}
                options={[
                  { id: '2d', text: '2D OpenStreetMap (Standard)' },
                  { id: '3d', text: '3D Satellite & Buildings' },
                ]}
              />
            </SpaceBetween>
          }
        >
          Delivery Vehicle Route Map
        </Header>
      }
    >
      {mapMode === '2d' ? (
        <div style={{ width: '100%', height: 600, borderRadius: 12, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
          <MapContainer
            center={[defaultCenterLat, defaultCenterLng]}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={true}
          >
            <MapViewUpdater
              center={[defaultCenterLat, defaultCenterLng]}
              zoom={12}
              routePoints={leafletRoute}
              markers={allMapMarkers}
            />

            {/* Standard OpenStreetMap Tiles matching user reference image */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              maxZoom={19}
            />

            {/* Route Polyline (Bold vibrant purple matching reference image) */}
            {leafletRoute.length > 0 && (
              <LeafletPolyline
                positions={leafletRoute}
                pathOptions={{
                  color: '#9333ea',
                  weight: 5,
                  opacity: 0.95,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            )}

            {/* Warehouse / Depot Hub Marker (Red House matching reference image) */}
            {warehouses.map((r, idx) => (
              <Marker
                key={`warehouse-${idx}`}
                position={[r.latitude, r.longitude]}
                icon={createDepotIcon(r.title || 'Dispatch Hub Depot')}
              >
                <Popup>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#ef4444' }}>{r.title || 'Distribution Depot Hub'}</h4>
                    <div style={{ maxWidth: 300, maxHeight: 180, overflow: 'auto' }}>
                      <ReactMarkdown>{`\`\`\`json\n${JSON.stringify(r, null, 2)}\n\`\`\``}</ReactMarkdown>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Customer Delivery Stop Markers (Purple Pins matching reference image) */}
            {customers.map((r, idx) => (
              <Marker
                key={`customer-${idx}`}
                position={[r.latitude, r.longitude]}
                icon={createCustomerIcon(r.deliveryName || `Stop #${idx + 1}`, idx + 1)}
              >
                <Popup>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#9333ea' }}>{r.deliveryName || 'Medical Center'}</h4>
                    <div style={{ maxWidth: 300, maxHeight: 180, overflow: 'auto' }}>
                      <ReactMarkdown>{`\`\`\`json\n${JSON.stringify(r, null, 2)}\n\`\`\``}</ReactMarkdown>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <Interactive3DMap
          markers={markers3D}
          polylines={polylines3D}
          center={[defaultCenterLng, defaultCenterLat]}
          zoom={13.5}
          pitch={58}
          bearing={-15}
          height={600}
          title='Vehicle Route & Dispatch Navigation'
          subtitle='3D Turn-by-turn trajectory with extruded urban buildings'
        />
      )}
    </Container>
  )
}

export default NextDayDeliveryMap
