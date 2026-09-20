import React, { useMemo, useState, type FunctionComponent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pagination, Table } from '@cloudscape-design/components'
import { useWarehouseContext } from '../../../contexts/WarehouseContext'
import { appvars } from '../../../config'
import { columnDefinitions as buildColumns } from './table-columns'
import { useCollectionList } from '../../../utils/useCollectionList'
import TablePreferences from '../../../components/TablePreferences'
import Interactive3DMap, { type MapMarkerItem } from '../../../components/MapComponent/Interactive3DMap'
import type { WarehouseData } from '../../../models'
import { Plus, RefreshCw, Search, Building2 } from 'lucide-react'

export const List: FunctionComponent = () => {
  const navigate = useNavigate()
  const [{ items, isLoading }, { refreshItems }] = useWarehouseContext()
  const [viewMode, setViewMode] = useState<'split' | 'table' | 'map'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const columnDefinitions = useMemo(() => buildColumns(navigate), [navigate])

  const filteredItems = useMemo(() => {
    return items.filter((w) => {
      const q = searchQuery.toLowerCase()
      return (
        w.warehouseName?.toLowerCase().includes(q) ||
        w.warehouseCode?.toLowerCase().includes(q) ||
        w.address?.toLowerCase().includes(q)
      )
    })
  }, [items, searchQuery])

  const { pageItems, pagination, preferences, sorting } = useCollectionList<WarehouseData>({
    items: filteredItems,
    columnDefinitions,
    defaultSort: { field: 'createdAt', descending: true },
  })

  const mapMarkers = useMemo<MapMarkerItem[]>(() => {
    return filteredItems
      .filter((w) => w.latitude && w.longitude)
      .map((w, idx) => ({
        id: w.Id || idx,
        latitude: Number(w.latitude),
        longitude: Number(w.longitude),
        title: w.warehouseName || `Warehouse ${w.warehouseCode}`,
        subtitle: w.address || 'Central Distribution Hub',
        type: 'warehouse',
      }))
  }, [filteredItems])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className='heading-page' style={{ fontSize: 22, fontWeight: 700 }}>
            Warehouses & Hubs ({items.length})
          </h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Central logistics distribution centers and regional cross-docking depots
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* View Mode Toggle */}
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

          <button onClick={() => refreshItems()} className='btn btn-secondary' title='Refresh warehouses'>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => navigate(`/${appvars.URL.WAREHOUSE}/new`)} className='btn btn-primary'>
            <Plus size={15} /> New Warehouse
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: 'var(--bg-surface)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}
      >
        <Search size={16} color='var(--text-muted)' />
        <input
          type='text'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Search warehouse by name, code, or address...'
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

      {/* Map + Table Views */}
      {viewMode === 'map' && (
        <div
          className='card'
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: 20,
            minHeight: 520,
          }}
        >
          <Interactive3DMap
            markers={mapMarkers}
            center={[73.0205, 19.0674]}
            zoom={11}
            height='500px'
          />
        </div>
      )}

      {viewMode === 'split' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 20 }}>
          <div
            className='card'
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 14 }}>
              HUB GEOGRAPHIC DISTRIBUTION
            </div>
            <div style={{ flex: 1, minHeight: 400 }}>
              <Interactive3DMap
                markers={mapMarkers}
                center={[73.0205, 19.0674]}
                zoom={11}
                height='400px'
              />
            </div>
          </div>

          <div
            className='card'
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 20,
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <Table
                columnDefinitions={columnDefinitions}
                items={pageItems}
                loading={isLoading}
                loadingText='Loading warehouses...'
                sortingColumn={sorting.sortingColumn}
                sortingDescending={sorting.sortingDescending}
                onSortingChange={({ detail }) => sorting.onSortingChange(detail)}
                pagination={
                  <Pagination
                    currentPageIndex={pagination.currentPageIndex}
                    pagesCount={pagination.pagesCount}
                    onChange={({ detail }) => pagination.onChange(detail)}
                  />
                }
                empty='No warehouses found'
              />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'table' && (
        <div
          className='card'
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <Table
              columnDefinitions={columnDefinitions}
              items={pageItems}
              loading={isLoading}
              loadingText='Loading warehouses...'
              sortingColumn={sorting.sortingColumn}
              sortingDescending={sorting.sortingDescending}
              onSortingChange={({ detail }) => sorting.onSortingChange(detail)}
              pagination={
                <Pagination
                  currentPageIndex={pagination.currentPageIndex}
                  pagesCount={pagination.pagesCount}
                  onChange={({ detail }) => pagination.onChange(detail)}
                />
              }
              preferences={
                <TablePreferences
                  pageSize={preferences.pageSize}
                  onPageSizeChange={preferences.setPageSize}
                  pageSizeOptions={preferences.pageSizeOptions}
                />
              }
              empty='No warehouses found'
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default List
