import type { TableProps } from '@cloudscape-design/components'
import { Badge, Link } from '@cloudscape-design/components'
import type { NavigateFunction } from 'react-router-dom'
import type { CustomerLocationData } from '../../../models'
import { dayjslocal } from '../../../utils/dayjs'
import { appvars } from '../../../config'

export const columnDefinitions = (
  navigate: NavigateFunction,
): TableProps.ColumnDefinition<CustomerLocationData>[] => [
  {
    id: 'deliveryName',
    header: 'Hospital / Healthcare Facility',
    sortingField: 'deliveryName',
    width: 280,
    cell: (item) => (
      <Link
        href={`/${appvars.URL.CUSTOMER_LOCATION}/${item.Id}`}
        onFollow={(e) => {
          e.preventDefault()
          navigate(`/${appvars.URL.CUSTOMER_LOCATION}/${item.Id}`)
        }}
      >
        <span style={{ fontWeight: 700, color: '#0284c7' }}>{item.deliveryName}</span>
      </Link>
    ),
  },
  {
    id: 'deliveryCode',
    header: 'Location Code',
    sortingField: 'deliveryCode',
    width: 160,
    cell: (item) => <Badge color='blue'>{item.deliveryCode}</Badge>,
  },
  {
    id: 'address',
    header: 'Address / Area',
    sortingField: 'address',
    width: 420,
    cell: (item) => <span style={{ color: '#0f172a', fontWeight: 500 }}>{item.address}</span>,
  },
  {
    id: 'createdAt',
    header: 'Registered Date',
    sortingField: 'createdAt',
    width: 180,
    cell: (item) => <span style={{ color: '#475569', fontWeight: 500 }}>{dayjslocal(item.createdAt).format(appvars.DATETIMEFORMAT)}</span>,
  },
  {
    id: 'updatedAt',
    header: 'Last Modified',
    sortingField: 'updatedAt',
    width: 180,
    cell: (item) => <span style={{ color: '#475569', fontWeight: 500 }}>{dayjslocal(item.updatedAt).format(appvars.DATETIMEFORMAT)}</span>,
  },
]
