import type { TableProps } from '@cloudscape-design/components'
import type { NavigateFunction } from 'react-router-dom'
import type { WarehouseData } from '../../../models'
import { dayjslocal } from '../../../utils/dayjs'
import { appvars } from '../../../config'

export const columnDefinitions = (
  navigate: NavigateFunction,
): TableProps.ColumnDefinition<WarehouseData>[] => [
  {
    id: 'warehouseName',
    header: 'Depot / Logistics Hub',
    sortingField: 'warehouseName',
    width: 280,
    cell: (item) => (
      <button
        onClick={() => navigate(`/${appvars.URL.WAREHOUSE}/${item.Id}`)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          textAlign: 'left',
          cursor: 'pointer',
          fontWeight: 600,
          color: 'var(--text-primary)',
          fontSize: 13,
        }}
      >
        {item.warehouseName}
      </button>
    ),
  },
  {
    id: 'warehouseCode',
    header: 'Hub Code',
    sortingField: 'warehouseCode',
    width: 140,
    cell: (item) => (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '2px 8px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: 'var(--status-success-bg)',
          color: '#598f1a',
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        <span className='status-dot status-dot-success' />
        <span>{item.warehouseCode}</span>
      </span>
    ),
  },
  {
    id: 'address',
    header: 'Location Address',
    sortingField: 'address',
    width: 420,
    cell: (item) => <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{item.address}</span>,
  },
  {
    id: 'createdAt',
    header: 'Commissioned Date',
    sortingField: 'createdAt',
    width: 170,
    cell: (item) => (
      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
        {dayjslocal(item.createdAt).format('YYYY-MM-DD HH:mm')}
      </span>
    ),
  },
]
