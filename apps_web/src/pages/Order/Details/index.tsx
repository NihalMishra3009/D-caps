import React, { useCallback, useState, type FunctionComponent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Modal, SpaceBetween } from '@cloudscape-design/components'
import { useOrderContext } from '../../../contexts/OrderQueryContext'
import { appvars } from '../../../config'
import NotFound from '../../../components/NotFound'
import { ArrowLeft, Package, Trash2, Edit, Calendar, MapPin, Scale } from 'lucide-react'

export const Details: FunctionComponent = () => {
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const [{ items }, { deleteItem }] = useOrderContext()
  const currentItem = items.find((x) => x.Id === orderId || (x as any).id === orderId || x.orderNo === orderId)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const onEditClick = useCallback(() => {
    if (currentItem == null) return
    navigate(`/${appvars.URL.ORDER}/${currentItem.Id}/edit`)
  }, [currentItem, navigate])

  const proceedWithDelete = useCallback(async () => {
    if (currentItem == null) return
    await deleteItem(currentItem.Id)
    navigate(`/${appvars.URL.ORDER}`)
  }, [deleteItem, navigate, currentItem])

  if (currentItem == null) {
    return <NotFound what='Order data' backUrl={appvars.URL.ORDER} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Modal
        visible={showDeleteModal}
        onDismiss={() => setShowDeleteModal(false)}
        header={`Delete Order #${currentItem.orderNo}`}
        footer={
          <Box float='right'>
            <SpaceBetween direction='horizontal' size='xs'>
              <Button variant='link' onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant='primary' onClick={proceedWithDelete}>
                Delete
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        Are you sure you want to delete order <b>#{currentItem.orderNo}</b> ({currentItem.deliveryName})?
      </Modal>

      {/* Back Navigation */}
      <div>
        <button
          onClick={() => navigate(`/${appvars.URL.ORDER}`)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Orders</span>
        </button>
      </div>

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className='heading-page' style={{ fontSize: 24, fontWeight: 700 }}>
              Consignment Order #{currentItem.orderNo}
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--accent-purple-light)',
                color: 'var(--accent-purple)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Package size={13} />
              <span>Consignment</span>
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Customer Destination: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{currentItem.deliveryName || (currentItem as any).customerName}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setShowDeleteModal(true)} className='btn btn-secondary' style={{ color: 'var(--status-error)' }}>
            <Trash2 size={14} /> Delete Order
          </button>
          <button onClick={onEditClick} className='btn btn-primary'>
            <Edit size={14} /> Edit Order
          </button>
        </div>
      </div>

      {/* KPI Specs Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <div className='card' style={{ padding: '18px 20px' }}>
          <div className='text-label'>CONSIGNMENT PAYLOAD</div>
          <div className='text-value-kpi' style={{ fontSize: 24, marginTop: 6, color: 'var(--accent-purple)' }}>
            {Number(currentItem.sumWeight || (currentItem as any).volume || 0).toLocaleString()} kg
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Net Consignment Demand
          </div>
        </div>

        <div className='card' style={{ padding: '18px 20px' }}>
          <div className='text-label'>DISPATCH DATE</div>
          <div className='text-value-kpi' style={{ fontSize: 24, marginTop: 6, color: 'var(--text-primary)' }}>
            {currentItem.orderDate || 'Scheduled'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Next-Day Delivery Band
          </div>
        </div>

        <div className='card' style={{ padding: '18px 20px' }}>
          <div className='text-label'>ORIGIN WAREHOUSE</div>
          <div className='text-value-kpi' style={{ fontSize: 24, marginTop: 6, color: '#598f1a' }}>
            {currentItem.warehouseCode || '95001200'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Navi Mumbai Central Hub
          </div>
        </div>

        <div className='card' style={{ padding: '18px 20px' }}>
          <div className='text-label'>CUSTOMER CODE</div>
          <div className='text-value-kpi' style={{ fontSize: 24, marginTop: 6, color: 'var(--text-secondary)' }}>
            {currentItem.deliveryCode}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Hospital Facility Code
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div
        className='card'
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 18 }}>
          CONSIGNMENT SPECIFICATIONS & AUDIT TRAIL
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Order ID</div>
            <div className='text-mono' style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
              {currentItem.Id}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Order Number</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
              #{currentItem.orderNo}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Hospital Destination</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
              {currentItem.deliveryName || (currentItem as any).customerName}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Payload Demand</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-purple)', marginTop: 4 }}>
              {Number(currentItem.sumWeight || (currentItem as any).volume || 0).toLocaleString()} kg
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Details
