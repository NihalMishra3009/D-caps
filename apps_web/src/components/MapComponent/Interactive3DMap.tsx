/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  RotateCw,
  Crosshair,
  Building2,
  Layers,
} from 'lucide-react'
import 'maplibre-gl/dist/maplibre-gl.css'

export interface MapMarkerItem {
  id: string | number
  latitude: number
  longitude: number
  title: string
  subtitle?: string
  type: 'warehouse' | 'customer' | 'destination' | 'origin' | 'vehicle'
  data?: any
}

export interface Interactive3DMapProps {
  markers?: MapMarkerItem[]
  polylines?: {
    coordinates: [number, number][] // [lng, lat]
    color?: string
    id?: string
  }[]
  center?: [number, number] // [lng, lat]
  zoom?: number
  pitch?: number
  bearing?: number
  height?: string | number
  title?: string
  subtitle?: string
}

// Global Satellite Earth combined with 3D Vector Building Extrusions (Clean Rectangular Command Center)
const GLOBAL_HYBRID_3D_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    // 1. Photorealistic Satellite Base
    'satellite-world': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics',
      maxzoom: 19,
    },
    // 2. OpenFreeMap Planet Vector Source for 3D Building Polygons & Heights
    'openmaptiles': {
      type: 'vector',
      tiles: ['https://tiles.openfreemap.org/planet/{z}/{x}/{y}.pbf'],
      maxzoom: 14,
    },
  },
  layers: [
    {
      id: 'space-background',
      type: 'background',
      paint: {
        'background-color': '#02040a',
      },
    },
    // Satellite Aerial Texture
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'satellite-world',
      paint: {
        'raster-opacity': 0.94,
        'raster-contrast': 0.15,
      },
    },
    // REAL 3D PHYSICAL BUILDINGS & HOUSES EXTRUSION ON TOP OF SATELLITE
    {
      id: '3d-buildings-extrusion',
      type: 'fill-extrusion',
      source: 'openmaptiles',
      'source-layer': 'building',
      minzoom: 12.5,
      paint: {
        'fill-extrusion-color': [
          'interpolate',
          ['linear'],
          [
            'coalesce',
            ['to-number', ['get', 'render_height']],
            ['to-number', ['get', 'height']],
            ['*', ['to-number', ['get', 'building:levels']], 3.5],
            8,
          ],
          0,
          '#1e293b',
          15,
          '#0284c7',
          40,
          '#38bdf8',
          100,
          '#818cf8',
          250,
          '#c084fc',
        ],
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          12.5,
          0,
          14.5,
          [
            'coalesce',
            ['to-number', ['get', 'render_height']],
            ['to-number', ['get', 'height']],
            ['*', ['to-number', ['get', 'building:levels']], 3.5],
            12,
          ],
        ],
        'fill-extrusion-base': ['coalesce', ['to-number', ['get', 'min_height']], 0],
        'fill-extrusion-opacity': 0.85,
        'fill-extrusion-vertical-gradient': true,
      },
    },
  ],
}

export const Interactive3DMap: React.FC<Interactive3DMapProps> = ({
  markers = [],
  polylines = [],
  center = [73.0297, 19.033], // Navi Mumbai [lng, lat]
  zoom = 15.5,
  pitch = 65,
  bearing = -20,
  height = 700,
  title = 'Global 3D Satellite & 3D Buildings Map',
  subtitle = 'Photorealistic Satellite Aerial Base + Real 3D Extruded Buildings & Houses',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const markerElementsRef = useRef<maplibregl.Marker[]>([])

  const [is3D, setIs3D] = useState(true)
  const [showBuildings, setShowBuildings] = useState(true)
  const [isOrbiting, setIsOrbiting] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerItem | null>(null)
  const [mapInstance, setMapInstance] = useState<MapLibreMap | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Initialize MapLibre Earth & 3D Building Engine
  useEffect(() => {
    if (!mapContainerRef.current) return

    const container = mapContainerRef.current

    const map = new maplibregl.Map({
      container: container,
      style: GLOBAL_HYBRID_3D_STYLE,
      center: center,
      zoom: zoom,
      pitch: pitch,
      bearing: bearing,
      maxPitch: 85,
    })

    mapRef.current = map
    setMapInstance(map)

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')

    const onReady = () => {
      setMapLoaded(true)
      map.resize()
    }

    if (map.isStyleLoaded()) {
      onReady()
    } else {
      map.on('load', onReady)
      map.on('style.load', onReady)
    }

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize()
      }
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      markerElementsRef.current.forEach((m) => m.remove())
      markerElementsRef.current = []
      map.remove()
      mapRef.current = null
      setMapInstance(null)
    }
  }, [])

  const activeLayerIdsRef = useRef<string[]>([])
  const activeSourceIdsRef = useRef<string[]>([])

  // 1. Immediately Render DOM Markers & Fit Bounds (Instant — does NOT wait for remote vector/satellite tiles)
  useEffect(() => {
    if (!mapInstance) return

    // Clean up previous DOM markers
    markerElementsRef.current.forEach((m) => m.remove())
    markerElementsRef.current = []

    if (!markers || markers.length === 0) return

    const bounds = new maplibregl.LngLatBounds()

    markers.forEach((m) => {
      if (!isNaN(m.longitude) && !isNaN(m.latitude)) {
        bounds.extend([m.longitude, m.latitude])
      }
    })

    if (polylines && polylines.length > 0) {
      polylines.forEach((poly) => {
        poly.coordinates.forEach(([lng, lat]) => {
          if (!isNaN(lng) && !isNaN(lat)) {
            bounds.extend([lng, lat])
          }
        })
      })
    }

    if (markers.length === 1 && (!polylines || polylines.length === 0)) {
      mapInstance.flyTo({
        center: [markers[0].longitude, markers[0].latitude],
        zoom: 16.2,
        pitch: 62,
        bearing: -20,
        duration: 800,
        essential: true,
      })
    } else if (!bounds.isEmpty()) {
      mapInstance.fitBounds(bounds, {
        padding: { top: 70, bottom: 70, left: 70, right: 70 },
        maxZoom: 15,
        duration: 800,
      })
    }

    // Attach markers immediately to the DOM overlay
    markers.forEach((marker) => {
      const el = document.createElement('div')
      el.className = 'earth-marker-3d'
      el.style.cursor = 'pointer'
      el.style.zIndex = '5'

      const isWh = marker.type === 'warehouse'
      const isDest = marker.type === 'destination'
      const isOrg = marker.type === 'origin'

      const badgeColor = isWh ? '#ef4444' : isOrg ? '#10b981' : isDest ? '#0284c7' : '#a855f7'

      el.innerHTML = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
          <!-- Pulsing Beacon Halo -->
          <div style="
            position: absolute;
            top: -6px;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 2px solid ${badgeColor};
            box-shadow: 0 0 16px ${badgeColor}, inset 0 0 8px ${badgeColor};
            animation: tacticalPulse 2s infinite ease-in-out;
            pointer-events: none;
          "></div>

          <!-- Floating 3D Badge -->
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: rgba(10, 18, 36, 0.96);
            border: 1.5px solid ${badgeColor};
            box-shadow: 0 0 16px ${badgeColor}88, 0 6px 14px rgba(0,0,0,0.8);
            border-radius: 18px;
            color: #ffffff;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.3px;
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            white-space: nowrap;
          " class="marker-pill">
            <span>${marker.title}</span>
            <div style="width: 6px; height: 6px; border-radius: 50%; background: ${badgeColor}; box-shadow: 0 0 8px ${badgeColor};"></div>
          </div>

          <!-- Vertical Anchor Pin Point -->
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid ${badgeColor};
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
          "></div>
        </div>
      `

      el.addEventListener('mouseenter', () => {
        const pill = el.querySelector('.marker-pill') as HTMLElement
        if (pill) {
          pill.style.transform = 'scale(1.1)'
          pill.style.borderColor = '#ffffff'
        }
      })

      el.addEventListener('mouseleave', () => {
        const pill = el.querySelector('.marker-pill') as HTMLElement
        if (pill) {
          pill.style.transform = 'scale(1)'
          pill.style.borderColor = badgeColor
        }
      })

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setSelectedMarker(marker)
        mapInstance.flyTo({
          center: [marker.longitude, marker.latitude],
          zoom: 17,
          pitch: 65,
          bearing: -20,
          duration: 1200,
          essential: true,
        })
      })

      const mapMarker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([marker.longitude, marker.latitude])
        .addTo(mapInstance)

      markerElementsRef.current.push(mapMarker)
    })
  }, [mapInstance, markers, polylines])

  // 2. Sync WebGL Route Polylines onto Real Earth Coordinates
  useEffect(() => {
    if (!mapInstance) return

    const renderPolylines = () => {
      if (!mapInstance.isStyleLoaded()) return

      // Clean up previous polyline layers and sources
      try {
        const style = mapInstance.getStyle()
        if (style && style.layers) {
          style.layers.forEach((layer) => {
            if (layer.id.startsWith('hybrid-route-')) {
              if (mapInstance.getLayer(layer.id)) mapInstance.removeLayer(layer.id)
            }
          })
        }
        activeLayerIdsRef.current.forEach((layerId) => {
          if (mapInstance.getLayer(layerId)) {
            mapInstance.removeLayer(layerId)
          }
        })
        activeLayerIdsRef.current = []

        if (style && style.sources) {
          Object.keys(style.sources).forEach((sourceId) => {
            if (sourceId.startsWith('hybrid-route-')) {
              if (mapInstance.getSource(sourceId)) mapInstance.removeSource(sourceId)
            }
          })
        }
        activeSourceIdsRef.current.forEach((sourceId) => {
          if (mapInstance.getSource(sourceId)) {
            mapInstance.removeSource(sourceId)
          }
        })
        activeSourceIdsRef.current = []
      } catch (e) {
        console.warn('Error during map layer/source cleanup', e)
      }

      // Add Polylines
      if (polylines && polylines.length > 0) {
        polylines.forEach((route, idx) => {
          if (!route.coordinates || route.coordinates.length < 2) return

          const routeKey = route.id ? String(route.id).replace(/[^a-zA-Z0-9_-]/g, '_') : `idx_${idx}`
          const sourceId = `hybrid-route-source-${routeKey}`
          const glowId = `hybrid-route-glow-${routeKey}`
          const lineId = `hybrid-route-line-${routeKey}`

          const geojsonData: GeoJSON.Feature<GeoJSON.LineString> = {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route.coordinates,
            },
          }

          try {
            if (mapInstance.getSource(sourceId)) {
              ;(mapInstance.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojsonData)
            } else {
              mapInstance.addSource(sourceId, {
                type: 'geojson',
                data: geojsonData,
              })
            }
            activeSourceIdsRef.current.push(sourceId)

            if (!mapInstance.getLayer(glowId)) {
              mapInstance.addLayer({
                id: glowId,
                type: 'line',
                source: sourceId,
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                  'line-color': route.color || '#38bdf8',
                  'line-width': 10,
                  'line-opacity': 0.6,
                  'line-blur': 3,
                },
              })
            }
            activeLayerIdsRef.current.push(glowId)

            if (!mapInstance.getLayer(lineId)) {
              mapInstance.addLayer({
                id: lineId,
                type: 'line',
                source: sourceId,
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                  'line-color': route.color || '#38bdf8',
                  'line-width': 5,
                  'line-opacity': 1.0,
                },
              })
            }
            activeLayerIdsRef.current.push(lineId)
          } catch (err) {
            console.error(`Error adding route layer for ${routeKey}`, err)
          }
        })
      }
    }

    if (mapInstance.isStyleLoaded()) {
      renderPolylines()
    }

    const handleStyleReady = () => {
      if (mapInstance.isStyleLoaded()) {
        renderPolylines()
      }
    }

    mapInstance.on('styledata', handleStyleReady)
    mapInstance.on('load', handleStyleReady)

    return () => {
      mapInstance.off('styledata', handleStyleReady)
      mapInstance.off('load', handleStyleReady)
    }
  }, [mapInstance, polylines, mapLoaded])

  // Toggle 3D Pitch
  const toggle3D = useCallback(() => {
    if (!mapRef.current) return
    const next3D = !is3D
    setIs3D(next3D)
    mapRef.current.easeTo({
      pitch: next3D ? 65 : 0,
      bearing: next3D ? -25 : 0,
      duration: 1000,
    })
  }, [is3D])

  // Toggle 3D Extruded Buildings Layer
  const toggle3DBuildings = useCallback(() => {
    if (!mapRef.current) return
    try {
      const currentVis = mapRef.current.getLayoutProperty('3d-buildings-extrusion', 'visibility')
      const nextVis = currentVis === 'none' ? 'visible' : 'none'
      mapRef.current.setLayoutProperty('3d-buildings-extrusion', 'visibility', nextVis)
      setShowBuildings(nextVis === 'visible')
    } catch (e) {
      console.warn('Could not toggle buildings layer', e)
    }
  }, [])

  // Fly down into 3D City View
  const flyToCity = useCallback(() => {
    if (!mapRef.current) return
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
      setIsOrbiting(false)
    }
    mapRef.current.flyTo({
      center: center,
      zoom: 16.5,
      pitch: 68,
      bearing: -25,
      duration: 2200,
      essential: true,
    })
    setSelectedMarker(null)
  }, [center])

  // Continuous Orbit Rotation
  const toggleOrbit = useCallback(() => {
    if (!mapRef.current) return
    if (isOrbiting) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
      setIsOrbiting(false)
    } else {
      setIsOrbiting(true)
      const rotateCamera = () => {
        if (!mapRef.current) return
        const currentBearing = mapRef.current.getBearing()
        mapRef.current.setBearing((currentBearing + 0.25) % 360)
        animFrameRef.current = requestAnimationFrame(rotateCamera)
      }
      rotateCamera()
    }
  }, [isOrbiting])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
        background: '#02040a',
      }}
    >
      <style>{`
        @keyframes tacticalPulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          50% { transform: scale(1.5); opacity: 0.2; }
          100% { transform: scale(0.6); opacity: 0.9; }
        }
      `}</style>

      {/* MapLibre 3D Hybrid Satellite + 3D Buildings Viewport */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Right-Side Floating Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 16,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {/* Focus 3D City View */}
        <button
          onClick={flyToCity}
          title='Zoom down into 3D Navi Mumbai Roads & Buildings'
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 14px',
            background: 'rgba(14, 165, 233, 0.3)',
            border: '1px solid #38bdf8',
            borderRadius: 8,
            color: '#38bdf8',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.2s',
          }}
        >
          <Crosshair size={16} />
          <span>Zoom into 3D City</span>
        </button>

        {/* Toggle 3D Extruded Buildings & Houses */}
        <button
          onClick={toggle3DBuildings}
          title='Toggle 3D Physical Extruded Buildings & Houses'
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 14px',
            background: showBuildings ? 'rgba(56, 189, 248, 0.35)' : 'rgba(15, 23, 42, 0.9)',
            border: showBuildings ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            color: showBuildings ? '#38bdf8' : '#e2e8f0',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.2s',
          }}
        >
          <Layers size={16} />
          <span>{showBuildings ? '3D Buildings: ON' : '3D Buildings: OFF'}</span>
        </button>



        {/* Orbit Control */}
        <button
          onClick={toggleOrbit}
          title={isOrbiting ? 'Pause 360° Orbit' : 'Start 360° Orbit Flyover'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 14px',
            background: isOrbiting ? 'rgba(56, 189, 248, 0.3)' : 'rgba(15, 23, 42, 0.9)',
            border: isOrbiting ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            color: isOrbiting ? '#38bdf8' : '#e2e8f0',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.2s',
          }}
        >
          <RotateCw size={16} className={isOrbiting ? 'animate-spin' : ''} />
          <span>{isOrbiting ? 'Orbit Active' : 'Orbit 360°'}</span>
        </button>
      </div>

      {/* Selected Marker Detail Modal Card */}
      {selectedMarker && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: 16,
            zIndex: 15,
            background: 'rgba(6, 11, 25, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: 12,
            padding: '14px 18px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.85)',
            maxWidth: 340,
            color: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <strong style={{ fontSize: '0.9rem', color: '#38bdf8' }}>{selectedMarker.title}</strong>
            </div>
            <button
              onClick={() => setSelectedMarker(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
              }}
            >
              X
            </button>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: 6 }}>
            {selectedMarker.subtitle || 'Tactical Node Point'}
          </div>
          <div
            style={{
              fontSize: '0.7rem',
              fontFamily: 'monospace',
              color: '#94a3b8',
              background: 'rgba(0,0,0,0.3)',
              padding: '4px 8px',
              borderRadius: 6,
            }}
          >
            LAT: {selectedMarker.latitude.toFixed(5)} | LNG: {selectedMarker.longitude.toFixed(5)}
          </div>
        </div>
      )}
    </div>
  )
}

export default Interactive3DMap
