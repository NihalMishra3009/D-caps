/**
 * Customer Locations List View (Reference Image 2)
 * Clean, modern interface with Map+Table, Map Only, Table Only toggles, search, refresh, and new customer button.
 */

import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomerLocationContext } from '../../../contexts/CustomerLocationContext'
import { appvars } from '../../../config'
import Interactive3DMap, { type MapMarkerItem } from '../../../components/MapComponent/Interactive3DMap'
import { dayjslocal } from '../../../utils/dayjs'
import {
  Plus,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  Building2,
  ChevronRight,
} from 'lucide-react'

export const List: React.FC = () => {
  const navigate = useNavigate()
  const [{ items: customers, isLoading }, { refreshItems }] = useCustomerLocationContext()

  const [viewMode, setViewMode] = useState<'split' | 'map' | 'table'>('table')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase()
      return (
        c.deliveryName?.toLowerCase().includes(q) ||
        String(c.deliveryCode).toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q)
      )
    })
  }, [customers, searchQuery])

  const mapMarkers = useMemo<MapMarkerItem[]>(() => {
    return filteredCustomers
      .filter((c) => c.latitude && c.longitude)
      .map((c, idx) => ({
        id: c.Id || idx,
        latitude: Number(c.latitude),
        longitude: Number(c.longitude),
        title: c.deliveryName || `Hospital ${c.deliveryCode}`,
        subtitle: c.address || 'Medical Facility',
        type: 'customer',
      }))
  }, [filteredCustomers])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Action Bar (Reference Image 2) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className='heading-page' style={{ fontSize: 22, fontWeight: 700 }}>
            Customer List ({customers.length})
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* View Mode Segmented Toggle (Map + Table | Map Only | Table Only) */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: 3,
              gap: 2,
            }}
          >
            <button
              onClick={() => setViewMode('split')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: viewMode === 'split' ? 'var(--accent-purple)' : 'transparent',
                color: viewMode === 'split' ? '#ffffff' : 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Map + Table
            </button>
            <button
              onClick={() => setViewMode('map')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: viewMode === 'map' ? 'var(--accent-purple)' : 'transparent',
                color: viewMode === 'map' ? '#ffffff' : 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Map Only
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: viewMode === 'table' ? 'var(--accent-purple)' : 'transparent',
                color: viewMode === 'table' ? '#ffffff' : 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Table Only
            </button>
          </div>

          <button onClick={() => refreshItems()} className='btn btn-secondary' title='Refresh customers'>
            <RefreshCw size={14} />
          </button>

          <button onClick={() => navigate(`/${appvars.URL.CUSTOMER_LOCATION}/new`)} className='btn btn-accent'>
            <Plus size={15} /> New Customer
          </button>
        </div>
      </div>

      {/* Search Bar (Reference Image 2) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          backgroundColor: 'var(--bg-surface)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <Search size={16} color='var(--text-muted)' />
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search by name, code or area...'
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: 13,
              color: 'var(--text-primary)',
            }}
          />
        </div>
        <Filter size={16} color='var(--text-muted)' style={{ cursor: 'pointer' }} />
      </div>

      {/* Map Viewport (if split or map mode) */}
      {(viewMode === 'split' || viewMode === 'map') && (
        <div
          className='card'
          style={{
            padding: 0,
            overflow: 'hidden',
            height: viewMode === 'map' ? 620 : 380,
          }}
        >
          <Interactive3DMap
            markers={mapMarkers}
            center={[73.0297, 19.033]}
            zoom={12.5}
            pitch={50}
            bearing={-15}
            height='100%'
            title='Customer & Facility Map'
            subtitle='Healthcare delivery destinations across Navi Mumbai'
          />
        </div>
      )}

      {/* Table Viewport (Reference Image 2) */}
      {(viewMode === 'split' || viewMode === 'table') && (
        <div
          className='card'
          style={{
            padding: 0,
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table className='logistics-table'>
              <thead>
                <tr>
                  <th style={{ width: '34%' }}>HOSPITAL / FACILITY</th>
                  <th style={{ width: '16%' }}>CODE</th>
                  <th style={{ width: '32%' }}>ADDRESS / AREA</th>
                  <th style={{ width: '14%' }}>REGISTERED</th>
                  <th style={{ width: '4%' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                      No customer locations found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr
                      key={cust.Id}
                      onClick={() => navigate(`/${appvars.URL.CUSTOMER_LOCATION}/${cust.Id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg-surface-muted)',
                              border: '1px solid var(--border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--text-secondary)',
                              flexShrink: 0,
                            }}
                          >
                            <Building2 size={14} />
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                            {cust.deliveryName}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className='text-mono' style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                          {cust.deliveryCode}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{cust.address}</span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {dayjslocal(cust.createdAt).format('YYYY-MM-DD HH:mm')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: 16 }}>
                        <ChevronRight size={14} color='var(--text-muted)' />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default List
