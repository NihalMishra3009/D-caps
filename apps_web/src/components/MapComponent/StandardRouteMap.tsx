/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline as LeafletPolyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface StandardRouteItem {
  id: string
  name?: string
  color?: string
  points: [number, number][] // [lat, lng]
}

export interface StandardMarkerItem {
  id: string | number
  latitude: number
  longitude: number
  title: string
  subtitle?: string
  sequence?: number
  type: 'warehouse' | 'customer' | 'origin' | 'destination' | 'vehicle'
  data?: any
}

export interface StandardRouteMapProps {
  markers?: StandardMarkerItem[]
  routes?: StandardRouteItem[]
  selectedMarkerId?: string | number | null
  onSelectMarker?: (marker: StandardMarkerItem) => void
  center?: [number, number] // [lat, lng]
  zoom?: number
  height?: number | string
}

// Depot / Origin Marker (Red House matching reference image)
const createDepotIcon = (name: string, withLabel = true) => {
  const safeName = (name || 'Depot Hub').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return L.divIcon({
    html: `
      <div style="display: flex; align-items: center; gap: 6px; pointer-events: auto; white-space: nowrap; transform: translate(-17px, -17px);">
        <div style="background-color: #ef4444; width: 34px; height: 34px; border-radius: 6px; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.35); border: 2px solid white;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
          </svg>
        </div>
        ${
          withLabel
            ? `<span style="background: rgba(255,255,255,0.96); padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 13px; color: #0f172a; box-shadow: 0 2px 5px rgba(0,0,0,0.25); border: 1.5px solid #ef4444;">
                ${safeName}
              </span>`
            : ''
        }
      </div>
    `,
    className: 'custom-depot-marker',
    iconSize: withLabel ? [140, 36] : [36, 36],
    iconAnchor: [17, 17],
  })
}

// Customer Delivery Stop Marker (Purple pin with person icon matching reference image)
const createCustomerIcon = (name: string, seq?: number, withLabel = true, isSelected = false) => {
  const safeName = (name || `Stop ${seq || ''}`).replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const pinBg = isSelected ? '#0284c7' : '#a855f7'
  const seqDisplay = seq !== undefined ? (seq === 0 ? 'D' : `${seq}`) : ''
  return L.divIcon({
    html: `
      <div style="display: flex; align-items: center; gap: 6px; pointer-events: auto; white-space: nowrap; transform: translate(-16px, -32px);">
        <div style="background-color: ${pinBg}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.35); border: 2px solid white;">
          <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; color: #ffffff;">
            ${seqDisplay || `<svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>`}
          </div>
        </div>
        ${
          withLabel
            ? `<span style="background: rgba(255,255,255,0.96); padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px; color: #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 1.5px solid ${isSelected ? '#0284c7' : '#cbd5e1'};">
                ${seq !== undefined && seq > 0 ? `Stop ${seq}: ` : ''}${safeName}
              </span>`
            : ''
        }
      </div>
    `,
    className: 'custom-customer-marker',
    iconSize: withLabel ? [160, 34] : [34, 34],
    iconAnchor: [16, 32],
  })
}

// Dynamic Auto-fit bounds updater
const MapBoundsFitter: React.FC<{
  markers: StandardMarkerItem[]
  routes: StandardRouteItem[]
  center: [number, number]
  zoom: number
}> = ({ markers, routes, center, zoom }) => {
  const map = useMap()

  useEffect(() => {
    const bounds = L.latLngBounds([])

    if (routes.length > 0) {
      routes.forEach((r) => {
        r.points.forEach(([lat, lng]) => {
          if (!isNaN(lat) && !isNaN(lng)) {
            bounds.extend([lat, lng])
          }
        })
      })
      // Include depot markers
      markers.forEach((m) => {
        if ((m.type === 'warehouse' || m.type === 'origin') && !isNaN(m.latitude) && !isNaN(m.longitude)) {
          bounds.extend([m.latitude, m.longitude])
        }
      })
    } else {
      markers.forEach((m) => {
        if (!isNaN(m.latitude) && !isNaN(m.longitude)) {
          bounds.extend([m.latitude, m.longitude])
        }
      })
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 14,
      })
    } else {
      map.setView(center, zoom)
    }

    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 150)
    return () => clearTimeout(timer)
  }, [markers, routes, center, zoom, map])

  return null
}

export const StandardRouteMap: React.FC<StandardRouteMapProps> = ({
  markers = [],
  routes = [],
  selectedMarkerId = null,
  onSelectMarker,
  center = [19.033, 73.0297], // Navi Mumbai [lat, lng]
  zoom = 12,
  height = 500,
}) => {
  const depots = markers.filter((m) => m.type === 'warehouse' || m.type === 'origin')
  const customers = markers.filter((m) => m.type === 'customer' || m.type === 'destination')

  // When few markers are displayed (<=6), show text labels permanently. If many, show on hover via Tooltip to avoid overlapping.
  const showPermanentLabels = customers.length <= 6

  return (
    <div
      style={{
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #cbd5e1',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        position: 'relative',
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <MapBoundsFitter markers={markers} routes={routes} center={center} zoom={zoom} />

        {/* Clean Standard OpenStreetMap Light Road Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          maxZoom={19}
        />

        {/* Render Connected Calculated Route Lines */}
        {routes.map((r, idx) => {
          if (!r.points || r.points.length < 2) return null
          const lineColor = r.color || '#9333ea' // Purple matching reference image
          return (
            <LeafletPolyline
              key={`route-line-${r.id || idx}`}
              positions={r.points}
              pathOptions={{
                color: lineColor,
                weight: 5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            >
              <Popup>
                <div style={{ padding: 4 }}>
                  <strong style={{ color: lineColor }}>{r.name || `Vehicle Route #${idx + 1}`}</strong>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {r.points.length} Road Waypoints
                  </div>
                </div>
              </Popup>
            </LeafletPolyline>
          )
        })}

        {/* Origin / Depot Hub Markers (Red House) */}
        {depots.map((d, idx) => {
          return (
            <Marker
              key={`depot-${d.id || idx}`}
              position={[d.latitude, d.longitude]}
              icon={createDepotIcon(d.title, true)}
              eventHandlers={{
                click: () => onSelectMarker && onSelectMarker(d),
              }}
            >
              <Popup>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase' }}>
                    DEPOT HUB
                  </div>
                  <h4 style={{ margin: '2px 0 4px 0', color: '#ef4444' }}>{d.title}</h4>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{d.subtitle || 'Distribution Depot Hub'}</p>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Customer Stop Markers (Purple Pins with Labels) */}
        {customers.map((c, idx) => {
          const isSelected =
            selectedMarkerId &&
            (String(c.id) === String(selectedMarkerId) ||
              (c.data &&
                (String(c.data.orderNo) === String(selectedMarkerId) ||
                  String(c.data.deliveryCode) === String(selectedMarkerId) ||
                  String(c.data.id) === String(selectedMarkerId))))
          const seq = c.sequence ?? idx + 1
          return (
            <Marker
              key={`cust-${c.id || idx}`}
              position={[c.latitude, c.longitude]}
              icon={createCustomerIcon(c.title, seq, showPermanentLabels, Boolean(isSelected))}
              eventHandlers={{
                click: () => onSelectMarker && onSelectMarker(c),
              }}
            >
              {!showPermanentLabels && (
                <Tooltip direction='top' offset={[0, -28]}>
                  <strong>{c.title}</strong>
                </Tooltip>
              )}
              <Popup>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#9333ea', textTransform: 'uppercase' }}>
                    {c.sequence === 0 ? 'Depot Hub' : `Stop ${seq}`}
                  </div>
                  <h4 style={{ margin: '2px 0 4px 0', color: '#9333ea' }}>{c.title}</h4>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{c.subtitle || 'Delivery Destination'}</p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default StandardRouteMap
