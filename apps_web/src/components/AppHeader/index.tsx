/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'aws-amplify/auth'
import { useAuthContext } from '../../contexts/AuthenticatedUserContext'
import { appvars } from '../../config'
import {
  Truck,
  Package,
  Layers,
  Send,
  Navigation,
  Sparkles,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Search,
} from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', href: '/', icon: <Navigation size={15} /> },
  { id: 'fleet', label: 'Transportations', href: `/${appvars.URL.VEHICLE}`, icon: <Truck size={15} /> },
  { id: 'delivery', label: 'Delivery', href: `/${appvars.URL.ORDER}`, icon: <Package size={15} /> },
  { id: 'load-planning', label: 'Load Planning', href: '/load-planning', icon: <Layers size={15} /> },
  { id: 'shipping', label: 'Shipping', href: '/shipping', icon: <Send size={15} /> },
  { id: 'solver', label: 'Command Center', href: `/${appvars.URL.SOLVER_JOB}`, icon: <Sparkles size={15} /> },
]

export const AppHeader: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { userInfo } = useAuthContext()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const displayName = (userInfo?.nickname ?? userInfo?.email ?? userInfo?.given_name ?? 'Dispatcher') as string

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
    <header
      id='app-header'
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          maxWidth: 1480,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link
            to='/'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              color: 'var(--text-primary)',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              <Truck size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                DISPATCH OPS
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Navi Mumbai Hub
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: 6,
              marginLeft: 16,
            }}
            className='desktop-nav'
          >
            <style>{`
              @media (min-width: 900px) {
                .desktop-nav { display: flex !important; }
                .mobile-toggle { display: none !important; }
              }
            `}</style>
            {MAIN_NAV_ITEMS.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                    backgroundColor: active ? 'var(--accent-dark)' : 'transparent',
                    color: active ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right Section: Quick Search & User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Quick Hub Status */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--bg-surface-muted)',
              border: '1px solid var(--border)',
              fontSize: 11,
              fontWeight: 500,
            }}
            className='hub-pill'
          >
            <style>{`
              @media (min-width: 1100px) {
                .hub-pill { display: flex !important; }
              }
            `}</style>
            <span className='status-dot status-dot-success'></span>
            <span style={{ color: 'var(--text-secondary)' }}>Hub Active:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>17 Hospitals</span>
          </div>

          {/* User Profile Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-surface-muted)',
                  border: '1px solid var(--border-strong)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                }}
              >
                <User size={13} />
              </div>
              <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </span>
              <ChevronDown size={14} color='var(--text-muted)' />
            </button>

            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 6px)',
                  width: 220,
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-md)',
                  padding: '8px 0',
                  zIndex: 1001,
                }}
              >
                <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Signed in as</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{displayName}</div>
                </div>

                <div style={{ padding: '4px 0' }}>
                  <Link
                    to={`/${appvars.URL.CUSTOMER_LOCATION}`}
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '8px 16px',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                    }}
                  >
                    Customer Locations
                  </Link>
                  <Link
                    to={`/${appvars.URL.WAREHOUSE}`}
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '8px 16px',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                    }}
                  >
                    Warehouses & Hubs
                  </Link>
                  <Link
                    to={`/${appvars.URL.DISTANCE_CACHE}`}
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '8px 16px',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                    }}
                  >
                    Distance Cache
                  </Link>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 4 }}>
                  <button
                    onClick={handleSignOut}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--status-error)',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='mobile-toggle'
            style={{
              padding: 6,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            padding: '12px 24px 18px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {MAIN_NAV_ITEMS.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 14,
                    fontWeight: active ? 600 : 500,
                    textDecoration: 'none',
                    backgroundColor: active ? 'var(--accent-dark)' : 'var(--bg-surface-muted)',
                    color: active ? 'var(--text-inverse)' : 'var(--text-primary)',
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}

export default AppHeader
