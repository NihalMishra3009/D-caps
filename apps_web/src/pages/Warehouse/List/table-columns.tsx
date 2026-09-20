import type { TableProps } from '@cloudscape-design/components'
import { Badge, Link } from '@cloudscape-design/components'
import type { NavigateFunction } from 'react-router-dom'
import type { WarehouseData } from '../../../models'
import { dayjslocal } from '../../../utils/dayjs'
import { appvars } from '../../../config'

export const columnDefinitions = (
  navigate: NavigateFunction,
): TableProps.ColumnDefinition<WarehouseData>[] => [
  {
    id: 'warehouseName',
    header: 'Distribution Depot / Logistics Hub',
    sortingField: 'warehouseName',
    width: 280,
    cell: (item) => (
      <Link
        href={`/${appvars.URL.WAREHOUSE}/${item.Id}`}
        onFollow={(e) => {
          e.preventDefault()
          navigate(`/${appvars.URL.WAREHOUSE}/${item.Id}`)
        }}
      >
        <span style={{ fontWeight: 700, color: '#0284c7' }}>{item.warehouseName}</span>
      </Link>
    ),
  },
  {
    id: 'warehouseCode',
    header: 'Hub Code',
    sortingField: 'warehouseCode',
    width: 160,
    cell: (item) => <Badge color='green'>{item.warehouseCode}</Badge>,
  },
  {
    id: 'address',
    header: 'Hub Location / Address',
    sortingField: 'address',
    width: 440,
    cell: (item) => <span style={{ color: '#0f172a', fontWeight: 500 }}>{item.address}</span>,
  },
  {
    id: 'createdAt',
    header: 'Commissioned Date',
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
