/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React, { useCallback, useState, type FunctionComponent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Modal, SpaceBetween } from '@cloudscape-design/components'
import { useWarehouseContext } from '../../../contexts/WarehouseContext'
import { appvars } from '../../../config'
import { dayjsutc } from '../../../utils/dayjs'
import NotFound from '../../../components/NotFound'
import Interactive3DMap, { type MapMarkerItem } from '../../../components/MapComponent/Interactive3DMap'
import { ArrowLeft, Building2, MapPin, Trash2, Edit } from 'lucide-react'

export const Details: FunctionComponent = () => {
  const navigate = useNavigate()
  const { warehouseId } = useParams<{ warehouseId: string }>()
  const [{ items: warehouseItems }, { deleteItem }] = useWarehouseContext()
  const currentItem = warehouseItems.find((x) => x.Id === warehouseId || (x as any).id === warehouseId || x.warehouseCode === warehouseId)

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const onEditClick = useCallback(() => {
    if (currentItem == null) return
    navigate(`/${appvars.URL.WAREHOUSE}/${currentItem.Id}/edit`)
  }, [currentItem, navigate])

  const proceedWithDelete = useCallback(async () => {
    if (currentItem == null) return
    await deleteItem(currentItem.Id)
    navigate(`/${appvars.URL.WAREHOUSE}`)
  }, [deleteItem, navigate, currentItem])

  if (currentItem == null) {
    return <NotFound what='Warehouse data' backUrl={appvars.URL.WAREHOUSE} />
  }

  const mapMarkers: MapMarkerItem[] = currentItem.latitude && currentItem.longitude
    ? [{
        id: currentItem.Id,
        latitude: Number(currentItem.latitude),
        longitude: Number(currentItem.longitude),
        title: currentItem.warehouseName,
        subtitle: currentItem.address || 'Central Hub',
        type: 'warehouse',
      }]
    : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Modal
        visible={showDeleteModal}
        onDismiss={() => setShowDeleteModal(false)}
        header={`Delete ${currentItem.warehouseCode} (${currentItem.Id})`}
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
        Are you sure you want to delete warehouse <b>{currentItem.warehouseCode}</b> ({currentItem.warehouseName})?
      </Modal>

      {/* Back Navigation */}
      <div>
        <button
          onClick={() => navigate(`/${appvars.URL.WAREHOUSE}`)}
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
          <span>Back to Warehouses</span>
        </button>
      </div>

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className='heading-page' style={{ fontSize: 24, fontWeight: 700 }}>
              Warehouse {currentItem.warehouseCode} — {currentItem.warehouseName}
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--status-success-bg)',
                color: '#598f1a',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span className='status-dot status-dot-success' />
              <span>Operational Hub</span>
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Address: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{currentItem.address || 'Navi Mumbai Distribution Center'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setShowDeleteModal(true)} className='btn btn-secondary' style={{ color: 'var(--status-error)' }}>
            <Trash2 size={14} /> Delete Hub
          </button>
          <button onClick={onEditClick} className='btn btn-primary'>
            <Edit size={14} /> Edit Hub Details
          </button>
        </div>
      </div>

      {/* Grid: Hub Specs & Location Map */}
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
            WAREHOUSE HUB SPECIFICATIONS
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Warehouse System ID</div>
              <div className='text-mono' style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
                {currentItem.Id}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Depot Code</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                {currentItem.warehouseCode}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Facility Name</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
                {currentItem.warehouseName}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Coordinates</div>
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

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last Updated</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginTop: 4 }}>
                {dayjsutc(currentItem.updatedAt).format(appvars.DATETIMEFORMAT)}
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
            FACILITY LOCATION MAP
          </div>
          <div style={{ flex: 1, minHeight: 280 }}>
            {currentItem.latitude && currentItem.longitude ? (
              <Interactive3DMap
                markers={mapMarkers}
                center={[Number(currentItem.longitude), Number(currentItem.latitude)]}
                zoom={13}
                height='280px'
              />
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '40px 0', textAlign: 'center' }}>
                No geographic coordinates configured for this warehouse.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Details
