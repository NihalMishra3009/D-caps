import type { TableProps } from '@cloudscape-design/components'
import { ProgressBar } from '@cloudscape-design/components'
import type { DeliveryJobData, selectDeliveryJobData } from '../../../models'
import { dayjslocal } from '../../../utils/dayjs'
import { appvars } from '../../../config'

export const columnDefinitions: TableProps.ColumnDefinition<DeliveryJobData>[] = [
  { 
    id: 'carNo', 
    header: 'Vehicle Reg', 
    sortingField: 'carNo', 
    width: 140, 
    cell: (i) => <span style={{ fontWeight: 700, color: 'var(--accent-purple)' }}>{i.carNo}</span> 
  },
  { 
    id: 'deliveryTimeGroup', 
    header: 'Time Band', 
    sortingField: 'deliveryTimeGroup', 
    width: 110, 
    cell: (i) => (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: 'var(--bg-surface-muted)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
        }}
      >
        Band {i.deliveryTimeGroup}
      </span>
    ),
  },
  {
    id: 'orderCount',
    header: 'Drops',
    width: 90,
    cell: (i) => (
      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
        {Array.isArray(i.segments) ? i.segments.length - 1 : 0} stops
      </span>
    ),
  },
  { 
    id: 'loadCapacity', 
    header: 'Assigned Load', 
    sortingField: 'loadCapacity', 
    width: 130, 
    cell: (i) => (
      <span className='text-mono' style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
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
      <span className='text-mono' style={{ color: 'var(--text-muted)' }}>
        {Number(i.maxCapacity || 0).toLocaleString()} kg
      </span>
    ) 
  },
  {
    id: 'utilization',
    header: 'Utilization',
    width: 180,
    cell: (i) => {
      const load = Number(i.loadCapacity)
      const max = Number(i.maxCapacity)
      if (isNaN(load) || isNaN(max) || max <= 0) {
        return <span style={{ color: 'var(--text-muted)' }}>N/A</span>
      }
      const utilPct = Math.round((load / max) * 100)
      const isOverloaded = utilPct > 100

      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
            <span style={{ fontWeight: 600, color: isOverloaded ? 'var(--status-error)' : 'var(--text-primary)' }}>
              {utilPct}%
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
              {load}/{max} kg
            </span>
          </div>
          <div style={{ width: '100%', height: 4, backgroundColor: 'var(--bg-surface-muted)', borderRadius: 2, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, utilPct)}%`,
                height: '100%',
                backgroundColor: isOverloaded ? 'var(--status-error)' : utilPct >= 80 ? 'var(--status-success)' : 'var(--accent-purple)',
                borderRadius: 2,
              }}
            />
          </div>
        </div>
      )
    },
  },
]

export const columnDefinitionsSegments: TableProps.ColumnDefinition<selectDeliveryJobData>[] = [
  { 
    id: 'deliveryCode', 
    header: 'Hospital Code', 
    width: 120, 
    cell: (i) => <span className='text-mono' style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{i.deliveryCode}</span> 
  },
  { 
    id: 'deliveryName', 
    header: 'Facility Destination', 
    width: 240, 
    cell: (i) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{i.deliveryName}</span> 
  },
  { 
    id: 'deliveryTimeGroup', 
    header: 'Time Window', 
    width: 110, 
    cell: (i) => (
      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
        Group {i.deliveryTimeGroup}
      </span>
    ) 
  },
  { 
    id: 'demands', 
    header: 'Consignment Weight', 
    width: 130, 
    cell: (i) => (
      <span className='text-mono' style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
        {Number(i.demands || 0).toLocaleString()} kg
      </span>
    ) 
  },
]
