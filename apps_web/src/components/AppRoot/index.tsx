/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Spinner, Box } from '@cloudscape-design/components'
import '@aws-amplify/ui-react/styles.css'

import { AuthenticatedUserContextProvider } from '../../contexts/AuthenticatedUserContext'
import { appvars } from '../../config'
import AppLayout from '../AppLayout'
import HomePage from '../../pages/HomePage'
import NotFound from '../NotFound'

const CustomerLocationRouter = lazy(() =>
  import('../../pages/CustomerLocation/router').then((m) => ({ default: m.CustomerLocationRouter }))
)
const WarehouseRouter = lazy(() =>
  import('../../pages/Warehouse/router').then((m) => ({ default: m.WarehouseRouter }))
)
const VehicleRouter = lazy(() =>
  import('../../pages/Vehicle/router').then((m) => ({ default: m.VehicleRouter }))
)
const OrderRouter = lazy(() =>
  import('../../pages/Order/router').then((m) => ({ default: m.OrderRouter }))
)
const DistanceCacheRouter = lazy(() =>
  import('../../pages/DistanceCache/router').then((m) => ({ default: m.DistanceCacheRouter }))
)
const SolverPageRouter = lazy(() =>
  import('../../pages/SolverPage/router').then((m) => ({ default: m.SolverPageRouter }))
)

const RouteLoadingFallback = () => (
  <Box padding={{ vertical: 'xxl' }} textAlign='center'>
    <Spinner size='large' />
  </Box>
)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const AppRoot = () => {
  return (
    <AuthenticatedUserContextProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route
              path={`/${appvars.URL.CUSTOMER_LOCATION}/*`}
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <CustomerLocationRouter />
                </Suspense>
              }
            />
            <Route
              path={`/${appvars.URL.WAREHOUSE}/*`}
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <WarehouseRouter />
                </Suspense>
              }
            />
            <Route
              path={`/${appvars.URL.VEHICLE}/*`}
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <VehicleRouter />
                </Suspense>
              }
            />
            <Route
              path={`/${appvars.URL.ORDER}/*`}
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <OrderRouter />
                </Suspense>
              }
            />
            <Route
              path={`/${appvars.URL.DISTANCE_CACHE}/*`}
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <DistanceCacheRouter />
                </Suspense>
              }
            />
            <Route
              path={`/${appvars.URL.SOLVER_JOB}/*`}
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <SolverPageRouter />
                </Suspense>
              }
            />
            <Route path='*' element={<NotFound what='Page' backUrl='' />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthenticatedUserContextProvider>
  )
}

// Allow direct local navigation for local development without Cognito UserPool
export default AppRoot
