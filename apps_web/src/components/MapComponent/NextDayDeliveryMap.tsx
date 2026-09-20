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

const createCustomIcon = (iconType: 'house' | 'person' | 'destination' | 'origin', color: string) => {
  let svgInner = ''
  if (iconType === 'house') {
    svgInner = '<path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />'
  } else if (iconType === 'destination') {
    svgInner = '<circle cx="12" cy="12" r="10" /><circle cx="9" cy="10" r="1.2" fill="#fff" /><circle cx="15" cy="10" r="1.2" fill="#fff" /><path d="M8 15c1.2 1.5 2.6 2 4 2s2.8-.5 4-2" stroke="#fff" stroke-width="1.5" fill="none" />'
  } else if (iconType === 'origin') {
    svgInner = '<path d="M8 2v9H6V2H4v20h2v-9h2v9h2V2H8zm9 0c-2 0-4 2-4 6 0 3 2 5 4 5v9h2V13c2 0 4-2 4-5 0-4-2-6-4-6h-2z" />'
  } else {
    svgInner = '<path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 10c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />'
  }

  const svgHtml = `
    <div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); border: 2px solid white;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
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

const houseIcon = createCustomIcon('house', '#ef4444')
const customerIcon = createCustomIcon('person', '#8b5cf6')

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

export const NextDayDeliveryMap: React.FC<NextDayDeliveryMapInputProps> = ({ segments, route }) => {
  const [mapMode, setMapMode] = useState<string>('3d')
  const [markers3D, setMarkers3D] = useState<MapMarkerItem[]>([])
  const [polylines3D, setPolylines3D] = useState<{ coordinates: [number, number][]; color?: string }[]>([])
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
          deliveryName: r.deliveryName,
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
    if (!route || !route.pointsEncoded) {
      setPolylines3D([])
      setLeafletRoute([])
      return
    }

    try {
      const decoded = polyline.decode(route.pointsEncoded)
      if (decoded && decoded.length > 0) {
        setLeafletRoute(decoded.map(([lat, lng]) => [lat, lng]))
        setPolylines3D([
          {
            coordinates: decoded.map(([lat, lng]) => [lng, lat]),
            color: '#38bdf8',
          },
        ])
      }
    } catch (e) {
      console.error('Error decoding route points', e)
    }
  }, [route])

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
                  { id: '3d', text: '3D Tactical (Three.js & MapLibre)' },
                  { id: '2d', text: '2D OpenStreetMap' },
                ]}
              />
            </SpaceBetween>
          }
        >
          MMR Vehicle Route & Turn-by-Turn Map
        </Header>
      }
    >
      {mapMode === '3d' ? (
        <Interactive3DMap
          markers={markers3D}
          polylines={polylines3D}
          center={[defaultCenterLng, defaultCenterLat]}
          zoom={13.5}
          pitch={58}
          bearing={-15}
          height={750}
          title='Vehicle Route & Dispatch Navigation'
          subtitle='3D Turn-by-turn trajectory with extruded urban buildings'
        />
      ) : (
        <div style={{ width: '100%', height: 750, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
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

            {warehouses.map((r, idx) => (
              <Marker key={`warehouse-${idx}`} position={[r.latitude, r.longitude]} icon={houseIcon}>
                <Popup>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#ef4444' }}>Distribution Depot Hub</h4>
                    <div style={{ maxWidth: 300, maxHeight: 180, overflow: 'auto' }}>
                      <ReactMarkdown>{`\`\`\`json\n${JSON.stringify(r, null, 2)}\n\`\`\``}</ReactMarkdown>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {customers.map((r, idx) => (
              <Marker key={`customer-${idx}`} position={[r.latitude, r.longitude]} icon={customerIcon}>
                <Popup>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#8b5cf6' }}>{r.deliveryName || 'Medical Center'}</h4>
                    <div style={{ maxWidth: 300, maxHeight: 180, overflow: 'auto' }}>
                      <ReactMarkdown>{`\`\`\`json\n${JSON.stringify(r, null, 2)}\n\`\`\``}</ReactMarkdown>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {leafletRoute.length > 0 && (
              <LeafletPolyline
                positions={leafletRoute}
                pathOptions={{
                  color: '#0284c7',
                  weight: 6,
                  opacity: 0.9,
                }}
              />
            )}
          </MapContainer>
        </div>
      )}
    </Container>
  )
}

export default NextDayDeliveryMap
