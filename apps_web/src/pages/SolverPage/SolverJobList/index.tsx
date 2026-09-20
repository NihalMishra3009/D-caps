/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { useMemo, type FunctionComponent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Header, Pagination, SpaceBetween, Table } from '@cloudscape-design/components'
import { useSolverJobQueryContext } from '../../../contexts/SolverJobQueryContext'
import { columnDefinitions as buildColumns } from './table-columns'
import { useCollectionList } from '../../../utils/useCollectionList'
import TablePreferences from '../../../components/TablePreferences'
import type { SolverJobData } from '../../../models'

export const SolverJobList: FunctionComponent = () => {
  const navigate = useNavigate()
  const [{ items, isLoading }, { refreshItems }] = useSolverJobQueryContext()
  const columnDefinitions = useMemo(() => buildColumns(navigate), [navigate])

  const { pageItems, pagination, preferences, sorting } = useCollectionList<SolverJobData>({
    items,
    columnDefinitions,
    defaultSort: { field: 'createdAt', descending: true },
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className='heading-page' style={{ fontSize: 22, fontWeight: 700 }}>
            Solver & Dispatch Jobs ({items.length})
          </h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Historical and active VRPTW route optimization runs and dispatch schedules
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => refreshItems()} className='btn btn-secondary' title='Refresh jobs list'>
            Refresh
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
            loadingText='Loading solver jobs...'
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
            empty='No solver jobs found'
          />
        </div>
      </div>
    </div>
  )
}

export default SolverJobList
