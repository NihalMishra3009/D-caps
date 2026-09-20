/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { useMemo, useState, type FunctionComponent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  FormField,
  Header,
  Input,
  Modal,
  Pagination,
  SpaceBetween,
  Table,
} from '@cloudscape-design/components'
import { useDistanceCacheContext } from '../../../contexts/DistanceCacheContext'
import NextDayDelivery from '../../../api/NextDayDelivery'
import { columnDefinitions as buildColumns } from './table-columns'
import { useCollectionList } from '../../../utils/useCollectionList'
import TablePreferences from '../../../components/TablePreferences'
import type { DistanceCacheData } from '../../../models'

export const List: FunctionComponent = () => {
  const navigate = useNavigate()
  const [{ items, isLoading }, { refreshItems }] = useDistanceCacheContext()
  const columnDefinitions = useMemo(() => buildColumns(navigate), [navigate])

  const { pageItems, pagination, preferences, sorting } = useCollectionList<DistanceCacheData>({
    items,
    columnDefinitions,
    defaultSort: { field: 'buildTime', descending: true },
  })

  const [modalBuildOpen, setModalBuildOpen] = useState(false)
  const [modalResultOpen, setModalResultOpen] = useState(false)
  const [reqWarehouseCode, setReqWarehouseCode] = useState('')
  const [rebuilding, setRebuilding] = useState(false)

  const buildDistanceCache = async () => {
    setRebuilding(true)
    try {
      const result = await NextDayDelivery.buildDistanceCache(reqWarehouseCode)
      console.log(result)
      setModalBuildOpen(false)
      setModalResultOpen(true)
    } catch (e) {
      console.log(e)
    } finally {
      setRebuilding(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Modal
        visible={modalBuildOpen}
        onDismiss={() => { if (!rebuilding) setModalBuildOpen(false) }}
        header='Rebuild Distance Cache Matrix'
        footer={
          <Box float='right'>
            <SpaceBetween direction='horizontal' size='xs'>
              <Button variant='link' onClick={() => setModalBuildOpen(false)} disabled={rebuilding}>
                Cancel
              </Button>
              <Button variant='primary' onClick={buildDistanceCache} loading={rebuilding}>
                Rebuild Cache
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size='m'>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Enter the Warehouse Hub code to pre-calculate the GraphHopper distance-time matrix.
          </p>
          <FormField label='Warehouse Code' controlId='ctlWarehouseCode'>
            <Input
              value={reqWarehouseCode}
              placeholder='e.g. 95001200'
              onChange={({ detail }) => setReqWarehouseCode(detail.value)}
            />
          </FormField>
        </SpaceBetween>
      </Modal>

      <Modal
        visible={modalResultOpen}
        onDismiss={() => setModalResultOpen(false)}
        header='Rebuild Distance Cache'
        footer={
          <Box float='right'>
            <Button onClick={() => setModalResultOpen(false)}>Close</Button>
          </Box>
        }
      >
        Distance cache rebuild job has been successfully submitted to the routing engine.
      </Modal>

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className='heading-page' style={{ fontSize: 22, fontWeight: 700 }}>
            Distance Cache Matrix ({items.length})
          </h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Pre-computed GraphHopper distance & duration matrices for instant solver convergence
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => refreshItems()} className='btn btn-secondary' title='Refresh distance matrices'>
            Refresh
          </button>
          <button onClick={() => setModalBuildOpen(true)} className='btn btn-primary'>
            Rebuild Matrix
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        className='card'
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <Table
            columnDefinitions={columnDefinitions}
            items={pageItems}
            loading={isLoading}
            loadingText='Loading distance matrices...'
            sortingColumn={sorting.sortingColumn}
            sortingDescending={sorting.sortingDescending}
            onSortingChange={({ detail }) => sorting.onSortingChange(detail)}
            pagination={
              <Pagination
                currentPageIndex={pagination.currentPageIndex}
                pagesCount={pagination.pagesCount}
                onChange={({ detail }) => pagination.onChange(detail)}
              />
            }
            preferences={
              <TablePreferences
                pageSize={preferences.pageSize}
                onPageSizeChange={preferences.setPageSize}
                pageSizeOptions={preferences.pageSizeOptions}
              />
            }
            empty='No distance cache matrices found'
          />
        </div>
      </div>
    </div>
  )
}

export default List
