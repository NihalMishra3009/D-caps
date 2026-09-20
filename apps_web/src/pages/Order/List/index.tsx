import React, { useMemo, useState, type FunctionComponent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pagination, Table } from '@cloudscape-design/components'
import { useOrderContext } from '../../../contexts/OrderQueryContext'
import { appvars } from '../../../config'
import { columnDefinitions as buildColumns } from './table-columns'
import { useCollectionList } from '../../../utils/useCollectionList'
import TablePreferences from '../../../components/TablePreferences'
import type { OrderData } from '../../../models'
import { Plus, RefreshCw, Search, Package } from 'lucide-react'

export const List: FunctionComponent = () => {
  const navigate = useNavigate()
  const [{ items, isLoading }, { refreshItems }] = useOrderContext()
  const [searchQuery, setSearchQuery] = useState('')
  const columnDefinitions = useMemo(() => buildColumns(navigate), [navigate])

  const filteredOrders = useMemo(() => {
    return items.filter((o) => {
      const q = searchQuery.toLowerCase()
      return (
        String(o.orderNo).toLowerCase().includes(q) ||
        String(o.deliveryCode).toLowerCase().includes(q) ||
        (o.deliveryName && o.deliveryName.toLowerCase().includes(q)) ||
        (o.warehouseCode && o.warehouseCode.toLowerCase().includes(q))
      )
    })
  }, [items, searchQuery])

  const { pageItems, pagination, preferences, sorting } = useCollectionList<OrderData>({
    items: filteredOrders,
    columnDefinitions,
    defaultSort: { field: 'orderDate', descending: true },
    secondarySort: { field: 'orderNo', descending: false },
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className='heading-page' style={{ fontSize: 22, fontWeight: 700 }}>
            Consignment Orders ({items.length})
          </h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Daily medical consignment demands and hospital delivery consignments
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => refreshItems()} className='btn btn-secondary' title='Refresh orders'>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => navigate(`/${appvars.URL.ORDER}/new`)} className='btn btn-primary'>
            <Plus size={15} /> New Order
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
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
          placeholder='Search consignments by order number, hospital name, or customer code...'
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

      {/* Main Table Card */}
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
            loadingText='Loading consignment orders...'
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
            empty='No consignment orders found'
          />
        </div>
      </div>
    </div>
  )
}

export default List
