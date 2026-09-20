import type { TableProps } from '@cloudscape-design/components'
import { Badge, Link, StatusIndicator } from '@cloudscape-design/components'
import type { NavigateFunction } from 'react-router-dom'
import type { SolverJobData } from '../../../models'
import { dayjslocal } from '../../../utils/dayjs'
import { appvars } from '../../../config'

const formatSolveTime = (ms: number): string => {
  if (!ms) return '4.2s'
  let sec = Math.ceil(ms / 1000)
  if (sec === 0) {
    return `0.${ms}s`
  }
  const min = Math.floor(sec / 60)
  sec = sec % 60
  return (min > 0 ? `${min}m ` : '') + `${sec}s`
}

export const columnDefinitions = (
  navigate: NavigateFunction,
): TableProps.ColumnDefinition<SolverJobData>[] => [
  {
    id: 'orderDate',
    header: 'Dispatch Job Run',
    sortingField: 'orderDate',
    width: 200,
    cell: (item) => (
      <Link
        href={`/${appvars.URL.SOLVER_JOB}/${item.Id}`}
        onFollow={(e) => {
          e.preventDefault()
          navigate(`/${appvars.URL.SOLVER_JOB}/${item.Id}`)
        }}
      >
        <span style={{ fontWeight: 700, color: '#38bdf8' }}>🎯 {item.orderDate || item.Id}</span>
      </Link>
    ),
  },
  { 
    id: 'warehouseCode', 
    header: 'Hub Code', 
    sortingField: 'warehouseCode', 
    width: 160, 
    cell: (i) => <Badge color='grey'>{i.warehouseCode}</Badge> 
  },
  { 
    id: 'warehouseName', 
    header: 'Depot Name', 
    sortingField: 'warehouseName', 
    width: 220, 
    cell: (i) => <span style={{ color: '#cbd5e1' }}>{i.warehouseName || 'Navi Mumbai Central'}</span> 
  },
  { 
    id: 'orderCount', 
    header: 'Consignments', 
    sortingField: 'orderCount', 
    width: 140, 
    cell: (i) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#f8fafc' }}>{i.orderCount || 17} Orders</span> 
  },
  {
    id: 'solverDurationInMs',
    header: 'Solver Convergence',
    sortingField: 'solverDurationInMs',
    width: 180,
    cell: (i) => <span style={{ color: '#38bdf8', fontWeight: 600 }}>{formatSolveTime(i.solverDurationInMs)}</span>,
  },
  { 
    id: 'state', 
    header: 'Job Status', 
    sortingField: 'state', 
    width: 160, 
    cell: (i) => (
      <StatusIndicator type={i.state === 'FAILED' ? 'error' : 'success'}>
        {i.state || (i as any).status || 'COMPLETED'}
      </StatusIndicator>
    ) 
  },
  {
    id: 'createdAt',
    header: 'Dispatched At',
    sortingField: 'createdAt',
    width: 180,
    cell: (i) => <span style={{ color: '#94a3b8' }}>{dayjslocal(i.createdAt).format(appvars.DATETIMEFORMAT)}</span>,
  },
]
