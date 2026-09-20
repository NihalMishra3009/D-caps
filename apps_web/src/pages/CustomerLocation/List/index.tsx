import { useMemo, useState, type FunctionComponent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Header, Pagination, SegmentedControl, SpaceBetween, Table } from '@cloudscape-design/components'
import { useCustomerLocationContext } from '../../../contexts/CustomerLocationContext'
import { appvars } from '../../../config'
import { columnDefinitions as buildColumns } from './table-columns'
import { useCollectionList } from '../../../utils/useCollectionList'
import TablePreferences from '../../../components/TablePreferences'
import MapComponent from '../../../components/MapComponent'
import type { CustomerLocationData } from '../../../models'

export const List: FunctionComponent = () => {
  const navigate = useNavigate()
  const [{ items, isLoading }, { refreshItems }] = useCustomerLocationContext()
  const [viewMode, setViewMode] = useState<'split' | 'table' | 'map'>('split')
  const columnDefinitions = useMemo(() => buildColumns(navigate), [navigate])

  const { pageItems, pagination, preferences, sorting } = useCollectionList<CustomerLocationData>({
    items,
    columnDefinitions,
    defaultSort: { field: 'createdAt', descending: true },
  })

  return (
    <SpaceBetween size='l'>
      {(viewMode === 'split' || viewMode === 'map') && items.length > 0 && (
        <MapComponent customers={items} />
      )}

      {(viewMode === 'split' || viewMode === 'table') && (
        <Table
          header={
            <Header
              counter={`(${items.length})`}
              actions={
                <SpaceBetween direction='horizontal' size='xs'>
                  <SegmentedControl
                    selectedId={viewMode}
                    onChange={({ detail }) => setViewMode(detail.selectedId as any)}
                    options={[
                      { id: 'split', text: 'Map + Table' },
                      { id: 'map', text: 'Map Only' },
                      { id: 'table', text: 'Table Only' },
                    ]}
                  />
                  <Button iconName='refresh' onClick={() => refreshItems()} ariaLabel='Refresh' />
                  <Button variant='primary' onClick={() => navigate(`/${appvars.URL.CUSTOMER_LOCATION}/new`)}>
                    New Customer
                  </Button>
                </SpaceBetween>
              }
            >
              Customer List
            </Header>
          }
          columnDefinitions={columnDefinitions}
          items={pageItems}
          loading={isLoading}
          loadingText='Loading customers'
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
          variant='full-page'
          stickyHeader
          empty='No customers'
        />
      )}
    </SpaceBetween>
  )
}
