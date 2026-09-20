/**
 * FleetOrderList Component (aws_design.md Sections 11, 12, 17, 18, 36)
 * Compact order list styled matching the reference image:
 * Columns: Customer | Shipping/Order ID | Location | Status
 */

import React from 'react'

export interface FleetOrderItem {
  id: string
  orderNo: string
  customerName: string
  locationAddress: string
  weightKg?: number
  status: 'Complete' | 'On Delivery' | 'Scheduled' | 'Pending'
}

interface FleetOrderListProps {
  orders: FleetOrderItem[]
  selectedOrderId?: string | null
  onSelectOrder?: (order: FleetOrderItem) => void
  title?: string
}

export const FleetOrderList: React.FC<FleetOrderListProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  title = 'ORDER LIST',
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Table Header Strip */}
      <div
        style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {orders.length} Consignments
        </div>
      </div>

      <div style={{ overflowX: 'auto', maxHeight: 420, overflowY: 'auto' }}>
        <table className='logistics-table'>
          <thead>
            <tr>
              <th style={{ width: '32%' }}>CUSTOMER</th>
              <th style={{ width: '22%' }}>SHIPPING ID</th>
              <th style={{ width: '26%' }}>LOCATION</th>
              <th style={{ width: '20%', textAlign: 'right' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>
                  No orders assigned to this route
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isSelected = order.id === selectedOrderId || order.orderNo === selectedOrderId
                const isComplete = order.status === 'Complete'
                const isOnDelivery = order.status === 'On Delivery'

                return (
                  <tr
                    key={order.id}
                    className={isSelected ? 'selected' : ''}
                    onClick={() => onSelectOrder && onSelectOrder(order)}
                    style={{ cursor: onSelectOrder ? 'pointer' : 'default' }}
                  >
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {order.customerName}
                      </span>
                    </td>
                    <td>
                      <span className='text-mono' style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        #{order.orderNo}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                        {order.locationAddress}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className='status-pill' style={{ justifyContent: 'flex-end' }}>
                        <span
                          className={`status-dot ${
                            isComplete
                              ? 'status-dot-success'
                              : isOnDelivery
                              ? 'status-dot-warning'
                              : 'status-dot-info'
                          }`}
                        />
                        <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{order.status}</span>
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default FleetOrderList
