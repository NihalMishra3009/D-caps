import type { TableProps } from '@cloudscape-design/components'
import { Badge, Link } from '@cloudscape-design/components'
import type { NavigateFunction } from 'react-router-dom'
import type { VehicleData } from '../../../models'
import { appvars } from '../../../config'

export const columnDefinitions = (
  navigate: NavigateFunction,
): TableProps.ColumnDefinition<VehicleData>[] => [
  {
    id: 'carNo',
    header: 'Vehicle Reg No.',
    sortingField: 'carNo',
    width: 220,
    cell: (item) => (
      <Link
        href={`/${appvars.URL.VEHICLE}/${item.Id}`}
        onFollow={(e) => {
          e.preventDefault()
          navigate(`/${appvars.URL.VEHICLE}/${item.Id}`)
        }}
      >
        <span style={{ fontWeight: 700, color: '#0284c7' }}>{item.carNo}</span>
      </Link>
    ),
  },
  {
    id: 'warehouseCode',
    header: 'Operating Hub Code',
    sortingField: 'warehouseCode',
    width: 200,
    cell: (item) => <Badge color='grey'>{item.warehouseCode}</Badge>,
  },
  {
    id: 'carGrade',
    header: 'Payload Grade',
    sortingField: 'carGrade',
    width: 160,
    cell: (item) => {
      const color = item.carGrade?.includes('5') ? 'blue' : item.carGrade?.includes('2.5') ? 'green' : 'grey'
      return <Badge color={color as any}>{item.carGrade}</Badge>
    },
  },
  {
    id: 'maxWeight',
    header: 'Max Capacity (kg)',
    sortingField: 'maxWeight',
    width: 180,
    cell: (item) => (
      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
        {Number(item.maxWeight).toLocaleString()} kg
      </span>
    ),
  },
]
