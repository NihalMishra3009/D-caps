/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React, { useState, useMemo, type FunctionComponent } from 'react'
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { appvars } from '../../config'
import AppSidebar from '../AppSidebar'
import { ChevronRight } from 'lucide-react'

const SECTIONS: { url: string; label: string }[] = [
  { url: appvars.URL.CUSTOMER_LOCATION, label: 'Customer Locations' },
  { url: appvars.URL.WAREHOUSE, label: 'Warehouses & Hubs' },
  { url: appvars.URL.VEHICLE, label: 'Vehicles Fleet' },
  { url: appvars.URL.ORDER, label: 'Consignment Orders' },
  { url: appvars.URL.DISTANCE_CACHE, label: 'Distance Cache Matrix' },
  { url: appvars.URL.SOLVER_JOB, label: 'Solver & Dispatch Jobs' },
]

export const AppLayout: FunctionComponent = () => {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    if (segments.length === 0) {
      return []
    }

    const list = [{ label: 'Overview', href: '/' }]
    const rootSegment = segments[0]
    const section = SECTIONS.find((s) => s.url === rootSegment)

    if (section) {
      list.push({ label: section.label, href: `/${section.url}` })
    } else {
      list.push({ label: rootSegment, href: `/${rootSegment}` })
    }

    if (segments.length > 1) {
      const tail = segments.slice(1).join(' / ')
      list.push({ label: tail, href: `/${segments.join('/')}` })
    }

    return list
  }, [location.pathname])

  const isHome = location.pathname === '/'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-page)' }}>
      {/* Left Sidebar (Reference Image 1) */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        {/* Top Minimal Breadcrumb Bar */}
        {!isHome && breadcrumbs.length > 0 && (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border)',
              padding: '12px 28px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: 'var(--text-muted)',
              }}
            >
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1
                return (
                  <React.Fragment key={crumb.href + idx}>
                    {idx > 0 && <ChevronRight size={13} color='var(--text-muted)' />}
                    {isLast ? (
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{crumb.label}</span>
                    ) : (
                      <Link
                        to={crumb.href}
                        style={{
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                        }}
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        )}

        {/* Page Content Container with Smooth Animation */}
        <main
          style={{
            flex: 1,
            width: '100%',
            maxWidth: 1680,
            margin: '0 auto',
            padding: '24px 32px 64px',
            boxSizing: 'border-box',
          }}
        >
          <div key={location.pathname} className='page-fade-in'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
