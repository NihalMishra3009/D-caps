/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { signOut } from 'aws-amplify/auth'
import { useAuthContext } from '../../contexts/AuthenticatedUserContext'
import { appvars } from '../../config'
import {
  Truck,
  Package,
  MapPin,
  Building2,
  Database,
  Sparkles,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

export const SIDEBAR_NAV: NavSection[] = [
  {
    items: [
      {
        id: 'overview',
        label: 'Overview & Command',
        href: '/',
        icon: <LayoutDashboard size={17} />,
      },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      {
        id: 'customers',
        label: 'Customer Locations',
        href: `/${appvars.URL.CUSTOMER_LOCATION}`,
        icon: <MapPin size={17} />,
      },
      {
        id: 'warehouses',
        label: 'Warehouses & Hubs',
        href: `/${appvars.URL.WAREHOUSE}`,
        icon: <Building2 size={17} />,
      },
      {
        id: 'vehicles',
        label: 'Vehicles Fleet',
        href: `/${appvars.URL.VEHICLE}`,
        icon: <Truck size={17} />,
      },
      {
        id: 'orders',
        label: 'Consignment Orders',
        href: `/${appvars.URL.ORDER}`,
        icon: <Package size={17} />,
      },
    ],
  },
  {
    title: 'OPTIMIZATION ENGINE',
    items: [
      {
        id: 'dist-cache',
        label: 'Distance Cache Matrix',
        href: `/${appvars.URL.DISTANCE_CACHE}`,
        icon: <Database size={17} />,
      },
      {
        id: 'solver',
        label: 'Solver & Dispatch Jobs',
        href: `/${appvars.URL.SOLVER_JOB}`,
        icon: <Sparkles size={17} />,
      },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export const AppSidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation()
  const { userInfo } = useAuthContext()

  const displayName = (userInfo?.nickname ?? userInfo?.email ?? userInfo?.given_name ?? 'Local Admin') as string
  const initials = displayName.slice(0, 2).toUpperCase()

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (e) {
      console.error('Sign out error', e)
    }
  }

  return (
    <aside
      style={{
        width: collapsed ? 72 : 250,
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width var(--transition-fast)',
        flexShrink: 0,
        height: '100vh',
        maxHeight: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Top Header / Logo Section */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div
          style={{
            height: 58,
            padding: collapsed ? '0 8px' : '0 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--border-light)',
            flexShrink: 0,
          }}
        >
          {!collapsed ? (
            <Link
              to='/'
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textDecoration: 'none',
                color: 'var(--text-primary)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0,
                }}
              >
                <Truck size={16} />
              </div>
              <div style={{ whiteSpace: 'nowrap' }}>
                <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  DISPATCHOPS
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  NAVI MUMBAI HUB
                </div>
              </div>
            </Link>
          ) : (
            <button
              onClick={onToggle}
              title='Expand menu'
              style={{
                background: 'var(--bg-surface-muted)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              <ChevronRight size={16} />
            </button>
          )}

          {!collapsed && (
            <button
              onClick={onToggle}
              title='Collapse menu'
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
              }}
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav
          style={{
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {SIDEBAR_NAV.map((section, sIdx) => (
            <div key={sIdx}>
              {section.title && !collapsed && (
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.06em',
                    padding: '0 10px 6px',
                    textTransform: 'uppercase',
                  }}
                >
                  {section.title}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {section.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      title={collapsed ? item.label : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: collapsed ? '8px 0' : '8px 10px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        borderRadius: 'var(--radius-sm)',
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: active ? 600 : 500,
                        backgroundColor: active ? 'var(--accent-purple-light)' : 'transparent',
                        color: active ? 'var(--accent-purple)' : 'var(--text-secondary)',
                        borderLeft: active && !collapsed ? '3px solid var(--accent-purple)' : '3px solid transparent',
                        transition: 'all var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-surface-muted)'
                          ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                          ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
                        }
                      }}
                    >
                      <span style={{ color: active ? 'var(--accent-purple)' : 'inherit', display: 'flex' }}>
                        {item.icon}
                      </span>
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom User / Profile Section (Reference 1) */}
      <div
        style={{
          borderTop: '1px solid var(--border-light)',
          padding: collapsed ? '12px 8px' : '12px 14px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-muted)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-primary)',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Dispatcher Role</div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={handleSignOut}
              title='Sign Out'
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--status-error)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

export default AppSidebar
