import type { TableProps } from '@cloudscape-design/components'
import { Badge, Link, StatusIndicator } from '@cloudscape-design/components'
import type { NavigateFunction } from 'react-router-dom'
import type { DistanceCacheData } from '../../../models'
import { appvars } from '../../../config'

export const columnDefinitions = (
  navigate: NavigateFunction,
): TableProps.ColumnDefinition<DistanceCacheData>[] => [
  {
    id: 'id',
    header: 'Cache Matrix ID',
    width: 220,
    cell: (item) => (
      <Link
        href={`/${appvars.URL.DISTANCE_CACHE}/${item.Id}`}
        onFollow={(e) => {
          e.preventDefault()
          navigate(`/${appvars.URL.DISTANCE_CACHE}/${item.Id}`)
        }}
      >
        <span style={{ fontWeight: 700, color: '#38bdf8' }}>⚡ {item.Id}</span>
      </Link>
    ),
  },
  {
    id: 'warehouseCode',
    header: 'Hub Code',
    sortingField: 'warehouseCode',
    width: 180,
    cell: (item) => <Badge color='grey'>{item.warehouseCode}</Badge>,
  },
  {
    id: 'numOfLocations',
    header: 'Node Dimension',
    sortingField: 'numOfLocations',
    width: 160,
    cell: (item) => (
      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#f8fafc' }}>
        {(item as any).dimension || item.numOfLocations || 17} Nodes
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Engine Status',
    sortingField: 'status',
    width: 160,
    cell: (item) => (
      <StatusIndicator type={item.status === 'SUCCESS' || item.status === 'COMPLETED' ? 'success' : 'info'}>
        {item.status || 'READY'}
      </StatusIndicator>
    ),
  },
  {
    id: 'buildTime',
    header: 'Calculated At',
    sortingField: 'buildTime',
    width: 200,
    cell: (item) => <span style={{ color: '#94a3b8' }}>{(item as any).lastCalculated || item.buildTime || 'Live Cache'}</span>,
  },
]
