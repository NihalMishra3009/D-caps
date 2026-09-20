import type { TableProps } from '@cloudscape-design/components'
import type { NavigateFunction } from 'react-router-dom'
import type { OrderData } from '../../../models'
import { appvars } from '../../../config'

export const columnDefinitions = (
  navigate: NavigateFunction,
): TableProps.ColumnDefinition<OrderData>[] => [
  {
    id: 'orderNo',
    header: 'Consignment No',
    sortingField: 'orderNo',
    width: 170,
    cell: (item) => (
      <button
        onClick={() => navigate(`/${appvars.URL.ORDER}/${item.Id}`)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          textAlign: 'left',
          cursor: 'pointer',
          fontWeight: 700,
          color: 'var(--text-primary)',
          fontSize: 13,
        }}
      >
        <span className='text-mono'>#{item.orderNo || item.Id}</span>
      </button>
    ),
  },
  { 
    id: 'orderDate', 
    header: 'Dispatch Date', 
    sortingField: 'orderDate', 
    width: 140, 
    cell: (i) => <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{i.orderDate}</span> 
  },
  { 
    id: 'warehouseCode', 
    header: 'Origin Hub', 
    sortingField: 'warehouseCode', 
    width: 130, 
    cell: (i) => (
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
        {i.warehouseCode}
      </span>
    ) 
  },
  { 
    id: 'deliveryName', 
    header: 'Hospital Destination', 
    sortingField: 'deliveryName', 
    width: 320, 
    cell: (i) => (
      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
        {i.deliveryName || (i as any).customerName}
      </span>
    ) 
  },
  { 
    id: 'sumWeight', 
    header: 'Payload (kg)', 
    sortingField: 'sumWeight', 
    width: 150, 
    cell: (i) => (
      <span className='text-mono' style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>
        {Number(i.sumWeight || (i as any).volume || 0).toLocaleString()} kg
      </span>
    ) 
  },
]
