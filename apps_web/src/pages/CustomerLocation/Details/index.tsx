/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React, { useCallback, useState, type FunctionComponent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Modal, SpaceBetween } from '@cloudscape-design/components'
import { useCustomerLocationContext } from '../../../contexts/CustomerLocationContext'
import { appvars } from '../../../config'
import { dayjsutc } from '../../../utils/dayjs'
import NotFound from '../../../components/NotFound'
import Interactive3DMap, { type MapMarkerItem } from '../../../components/MapComponent/Interactive3DMap'
import { ArrowLeft, Building2, MapPin, Trash2, Edit, Hospital } from 'lucide-react'

export const Details: FunctionComponent = () => {
  const navigate = useNavigate()
  const { customerLocationId } = useParams<{ customerLocationId: string }>()
  const [{ items }, { deleteItem }] = useCustomerLocationContext()
  const currentItem = items.find((x) => x.Id === customerLocationId || (x as any).id === customerLocationId || x.deliveryCode === customerLocationId)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const onEditClick = useCallback(() => {
    if (currentItem == null) return
    navigate(`/${appvars.URL.CUSTOMER_LOCATION}/${currentItem.Id}/edit`)
  }, [currentItem, navigate])

  const proceedWithDelete = useCallback(async () => {
    if (currentItem == null) return
    await deleteItem(currentItem.Id)
    navigate(`/${appvars.URL.CUSTOMER_LOCATION}`)
  }, [deleteItem, navigate, currentItem])

  if (currentItem == null) {
    return <NotFound what='Customer location data' backUrl={appvars.URL.CUSTOMER_LOCATION} />
  }

  const mapMarkers: MapMarkerItem[] = currentItem.latitude && currentItem.longitude
    ? [{
        id: currentItem.Id,
        latitude: Number(currentItem.latitude),
        longitude: Number(currentItem.longitude),
        title: currentItem.deliveryName || `Hospital ${currentItem.deliveryCode}`,
        subtitle: currentItem.address || 'Medical Facility Node',
        type: 'customer',
      }]
    : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Modal
        visible={showDeleteModal}
        onDismiss={() => setShowDeleteModal(false)}
        header={`Delete ${currentItem.deliveryCode} (${currentItem.Id})`}
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
        Are you sure you want to delete customer location <b>{currentItem.deliveryCode}</b> ({currentItem.deliveryName})?
      </Modal>

      {/* Back Navigation */}
      <div>
        <button
          onClick={() => navigate(`/${appvars.URL.CUSTOMER_LOCATION}`)}
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
          <span>Back to Customers</span>
        </button>
      </div>

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className='heading-page' style={{ fontSize: 24, fontWeight: 700 }}>
              Customer #{currentItem.deliveryCode} — {currentItem.deliveryName}
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--status-info-bg)',
                color: '#2563eb',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <MapPin size={13} />
              <span>Hospital Node</span>
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Address: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{currentItem.address || 'Navi Mumbai Medical Facility'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setShowDeleteModal(true)} className='btn btn-secondary' style={{ color: 'var(--status-error)' }}>
            <Trash2 size={14} /> Delete Customer
          </button>
          <button onClick={onEditClick} className='btn btn-primary'>
            <Edit size={14} /> Edit Customer
          </button>
        </div>
      </div>

      {/* Grid: Customer Specs & Location Map */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 20 }}>
        {/* Specs Card */}
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
            CUSTOMER FACILITY METADATA
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Customer Location ID</div>
              <div className='text-mono' style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
                {currentItem.Id}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Delivery Facility Code</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                {currentItem.deliveryCode}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Hospital Facility Name</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
                {currentItem.deliveryName}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Assigned Origin Hub</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#598f1a', marginTop: 4 }}>
                {currentItem.warehouseCode || '95001200'} (Central Hub)
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Geo Coordinates</div>
              <div className='text-mono' style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-purple)', marginTop: 4 }}>
                {currentItem.latitude}, {currentItem.longitude}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Created At</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginTop: 4 }}>
                {dayjsutc(currentItem.createdAt).utc().format(appvars.DATETIMEFORMAT)}
              </div>
            </div>
          </div>
        </div>

        {/* Location Map Card */}
        <div
          className='card'
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px 28px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 14 }}>
            HOSPITAL FACILITY LOCATION MAP
          </div>
          <div style={{ flex: 1, minHeight: 280 }}>
            {currentItem.latitude && currentItem.longitude ? (
              <Interactive3DMap
                markers={mapMarkers}
                center={[Number(currentItem.longitude), Number(currentItem.latitude)]}
                zoom={14}
                height='280px'
              />
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '40px 0', textAlign: 'center' }}>
                No geographic coordinates configured for this hospital facility.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Details
