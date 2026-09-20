import type { TableProps } from '@cloudscape-design/components'
import { Badge, ProgressBar } from '@cloudscape-design/components'
import type { DeliveryJobData, selectDeliveryJobData } from '../../../models'
import { dayjslocal } from '../../../utils/dayjs'
import { appvars } from '../../../config'

export const columnDefinitions: TableProps.ColumnDefinition<DeliveryJobData>[] = [
  { 
    id: 'carNo', 
    header: 'Vehicle Reg', 
    sortingField: 'carNo', 
    width: 130, 
    cell: (i) => <span style={{ fontWeight: 700, color: '#38bdf8' }}>{i.carNo}</span> 
  },
  { 
    id: 'deliveryTimeGroup', 
    header: 'Time Band', 
    sortingField: 'deliveryTimeGroup', 
    width: 110, 
    cell: (i) => <Badge color='blue'>Band {i.deliveryTimeGroup}</Badge> 
  },
  {
    id: 'orderCount',
    header: 'Stops',
    width: 100,
    cell: (i) => (
      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#f8fafc' }}>
        {Array.isArray(i.segments) ? i.segments.length : 0} drops
      </span>
    ),
  },
  { 
    id: 'loadCapacity', 
    header: 'Assigned Load', 
    sortingField: 'loadCapacity', 
    width: 130, 
    cell: (i) => (
      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#38bdf8' }}>
        {Number(i.loadCapacity || 0).toLocaleString()} kg
      </span>
    ) 
  },
  { 
    id: 'maxCapacity', 
    header: 'Max Payload', 
    sortingField: 'maxCapacity', 
    width: 130, 
    cell: (i) => (
      <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>
        {Number(i.maxCapacity || 0).toLocaleString()} kg
      </span>
    ) 
  },
  {
    id: 'utilization',
    header: 'Capacity Utilization',
    width: 200,
    cell: (i) => {
      const load = Number(i.loadCapacity)
      const max = Number(i.maxCapacity)
      if (isNaN(load) || isNaN(max) || max <= 0) {
        return <span style={{ color: '#94a3b8' }}>N/A</span>
      }
      const utilPct = Math.round((load / max) * 100)
      const barValue = Math.min(100, Math.max(0, utilPct))
      const status = utilPct > 100 ? 'error' : utilPct >= 80 ? 'success' : 'in-progress'
      return (
        <ProgressBar
          value={barValue}
          status={status}
          description={`${utilPct}% utilized (${load} / ${max} kg)`}
        />
      )
    },
  },
  {
    id: 'createdAt',
    header: 'Dispatched At',
    sortingField: 'createdAt',
    width: 160,
    cell: (i) => <span style={{ color: '#94a3b8' }}>{dayjslocal(i.createdAt).format(appvars.DATETIMEFORMAT)}</span>,
  },
]

export const columnDefinitionsSegments: TableProps.ColumnDefinition<selectDeliveryJobData>[] = [
  { 
    id: 'deliveryCode', 
    header: 'Hospital Code', 
    width: 140, 
    cell: (i) => <Badge color='blue'>{i.deliveryCode}</Badge> 
  },
  { 
    id: 'deliveryName', 
    header: 'Destination Medical Facility', 
    width: 250, 
    cell: (i) => <span style={{ fontWeight: 600, color: '#f8fafc' }}>{i.deliveryName}</span> 
  },
  { 
    id: 'deliveryTimeGroup', 
    header: 'Time Window', 
    width: 120, 
    cell: (i) => <Badge color='grey'>Group {i.deliveryTimeGroup}</Badge> 
  },
  { 
    id: 'demands', 
    header: 'Package Weight', 
    width: 140, 
    cell: (i) => (
      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#38bdf8' }}>
        {Number(i.demands || 0).toLocaleString()} kg
      </span>
    ) 
  },
]
