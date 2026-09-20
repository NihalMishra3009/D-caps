import type { TableProps } from '@cloudscape-design/components'
import { Badge, Link } from '@cloudscape-design/components'
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
      <Link
        href={`/${appvars.URL.ORDER}/${item.Id}`}
        onFollow={(e) => {
          e.preventDefault()
          navigate(`/${appvars.URL.ORDER}/${item.Id}`)
        }}
      >
        <span style={{ fontWeight: 700, color: '#0284c7' }}>{item.orderNo || item.Id}</span>
      </Link>
    ),
  },
  { 
    id: 'orderDate', 
    header: 'Dispatch Date', 
    sortingField: 'orderDate', 
    width: 150, 
    cell: (i) => <span style={{ color: '#475569', fontWeight: 500 }}>{i.orderDate}</span> 
  },
  { 
    id: 'warehouseCode', 
    header: 'Origin Hub', 
    sortingField: 'warehouseCode', 
    width: 150, 
    cell: (i) => <Badge color='grey'>{i.warehouseCode}</Badge> 
  },
  { 
    id: 'deliveryCode', 
    header: 'Dest Code', 
    sortingField: 'deliveryCode', 
    width: 140, 
    cell: (i) => <Badge color='blue'>{i.deliveryCode}</Badge> 
  },
  { 
    id: 'deliveryName', 
    header: 'Hospital Destination', 
    sortingField: 'deliveryName', 
    width: 320, 
    cell: (i) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{i.deliveryName || (i as any).customerName}</span> 
  },
  { 
    id: 'sumWeight', 
    header: 'Load Weight', 
    sortingField: 'sumWeight', 
    width: 160, 
    cell: (i) => (
      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0284c7' }}>
        {Number(i.sumWeight || (i as any).volume || 0).toLocaleString()} kg
      </span>
    ) 
  },
]
