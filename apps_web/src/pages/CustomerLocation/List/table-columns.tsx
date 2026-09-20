import type { TableProps } from '@cloudscape-design/components'
import type { NavigateFunction } from 'react-router-dom'
import type { CustomerLocationData } from '../../../models'
import { dayjslocal } from '../../../utils/dayjs'
import { appvars } from '../../../config'

export const columnDefinitions = (
  navigate: NavigateFunction,
): TableProps.ColumnDefinition<CustomerLocationData>[] => [
  {
    id: 'deliveryName',
    header: 'Hospital / Facility',
    sortingField: 'deliveryName',
    width: 280,
    cell: (item) => (
      <button
        onClick={() => navigate(`/${appvars.URL.CUSTOMER_LOCATION}/${item.Id}`)}
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
        {item.deliveryName}
      </button>
    ),
  },
  {
    id: 'deliveryCode',
    header: 'Code',
    sortingField: 'deliveryCode',
    width: 140,
    cell: (item) => (
      <span className='text-mono' style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
        {item.deliveryCode}
      </span>
    ),
  },
  {
    id: 'address',
    header: 'Address / Area',
    sortingField: 'address',
    width: 400,
    cell: (item) => <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{item.address}</span>,
  },
  {
    id: 'createdAt',
    header: 'Registered',
    sortingField: 'createdAt',
    width: 170,
    cell: (item) => (
      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
        {dayjslocal(item.createdAt).format('YYYY-MM-DD HH:mm')}
      </span>
    ),
  },
]
