/**
 * High-fidelity Vector Truck Graphic for Fleet Vehicle Canvas
 * Represents realistic modern commercial delivery truck with transparent backdrop and precise physical zones.
 */

import React from 'react'

interface TruckGraphicProps {
  className?: string
  color?: string
  width?: number | string
  height?: number | string
  accentColor?: string
}

export const TruckGraphic: React.FC<TruckGraphicProps> = ({
  width = '100%',
  height = 'auto',
  accentColor = '#7217f5',
}) => {
  return (
    <svg
      viewBox='0 0 900 420'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      style={{
        width,
        height,
        maxWidth: 780,
        display: 'block',
        margin: '0 auto',
        filter: 'drop-shadow(0 18px 24px rgba(0, 0, 0, 0.08))',
      }}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id='cargoBodyGrad' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='#fbfbfb' />
          <stop offset='60%' stopColor='#f0f0ee' />
          <stop offset='100%' stopColor='#e2e2dd' />
        </linearGradient>

        <linearGradient id='cabinGrad' x1='0' y1='0' x2='1' y2='0'>
          <stop offset='0%' stopColor='#2a2a2a' />
          <stop offset='85%' stopColor='#1c1c1c' />
          <stop offset='100%' stopColor='#121212' />
        </linearGradient>

        <linearGradient id='chassisGrad' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='#3a3a3a' />
          <stop offset='100%' stopColor='#1f1f1f' />
        </linearGradient>

        <linearGradient id='wheelRimGrad' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='#f0f0f0' />
          <stop offset='50%' stopColor='#a0a0a0' />
          <stop offset='100%' stopColor='#505050' />
        </linearGradient>

        <linearGradient id='glassGrad' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='#6e9cf5' stopOpacity='0.45' />
          <stop offset='100%' stopColor='#182848' stopOpacity='0.75' />
        </linearGradient>

        <filter id='shadowSoft' x='-10%' y='-10%' width='120%' height='130%'>
          <feDropShadow dx='0' dy='8' stdDeviation='10' floodColor='#000000' floodOpacity='0.15' />
        </filter>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx='440' cy='375' rx='380' ry='16' fill='#000000' fillOpacity='0.16' filter='blur(12px)' />
      <ellipse cx='440' cy='372' rx='330' ry='8' fill='#000000' fillOpacity='0.22' filter='blur(4px)' />

      {/* Underbody Chassis Rail */}
      <rect x='110' y='305' width='660' height='22' rx='4' fill='url(#chassisGrad)' stroke='#404040' strokeWidth='1.5' />
      
      {/* Fuel Tank & Battery Box */}
      <rect x='340' y='312' width='110' height='26' rx='5' fill='#2b2b2b' stroke='#555555' strokeWidth='1' />
      <line x1='375' y1='312' x2='375' y2='338' stroke='#444' strokeWidth='2' />
      <line x1='410' y1='312' x2='410' y2='338' stroke='#444' strokeWidth='2' />
      <rect x='470' y='314' width='75' height='24' rx='3' fill='#222222' stroke='#444' strokeWidth='1' />

      {/* =========================================================
          1. CARGO BOX (Main container body)
         ========================================================= */}
      <g id='cargo-container'>
        {/* Main Cargo Outer Wall */}
        <rect
          x='100'
          y='90'
          width='450'
          height='220'
          rx='10'
          fill='url(#cargoBodyGrad)'
          stroke='#d0d0cc'
          strokeWidth='2.5'
        />

        {/* Cargo Side Corrugation / Section Dividers */}
        <line x1='190' y1='95' x2='190' y2='305' stroke='#e0e0dc' strokeWidth='2' />
        <line x1='280' y1='95' x2='280' y2='305' stroke='#e0e0dc' strokeWidth='2' />
        <line x1='370' y1='95' x2='370' y2='305' stroke='#e0e0dc' strokeWidth='2' />
        <line x1='460' y1='95' x2='460' y2='305' stroke='#e0e0dc' strokeWidth='2' />

        {/* Top Edge Reinforcement & Corner Castings */}
        <path d='M100 100 Q100 90 110 90 L540 90 Q550 90 550 100 L550 105 L100 105 Z' fill='#333333' />
        <path d='M100 300 L550 300 L550 310 L100 310 Z' fill='#444444' />

        {/* Rear Door Hinges & Lock Rods */}
        <rect x='102' y='110' width='8' height='16' rx='2' fill='#666' />
        <rect x='102' y='190' width='8' height='16' rx='2' fill='#666' />
        <rect x='102' y='270' width='8' height='16' rx='2' fill='#666' />
        <line x1='106' y1='95' x2='106' y2='305' stroke='#888' strokeWidth='2' />

        {/* Modern Delivery Brand Decal / Stripe on Cargo */}
        <path d='M120 145 L530 145 L520 152 L120 152 Z' fill={accentColor} fillOpacity='0.85' />
        <path d='M120 156 L490 156 L482 160 L120 160 Z' fill='#242424' fillOpacity='0.6' />

        {/* Aerodynamic Roof Fairing Connector */}
        <path d='M550 95 L590 115 L590 160 L550 160 Z' fill='#e2e2de' stroke='#d0d0cb' strokeWidth='1.5' />
      </g>

      {/* =========================================================
          2. DRIVER CABIN (Front section)
         ========================================================= */}
      <g id='cabin-assembly'>
        {/* Aerodynamic Wind Deflector Roof */}
        <path
          d='M550 90 Q620 90 660 130 L660 160 L550 160 Z'
          fill='#2a2a2a'
          stroke='#1c1c1c'
          strokeWidth='2'
        />

        {/* Cabin Main Shell */}
        <path
          d='M550 160 L675 160 Q725 165 745 220 L765 285 Q770 305 750 310 L550 310 Z'
          fill='url(#cabinGrad)'
          stroke='#1a1a1a'
          strokeWidth='2.5'
        />

        {/* Front Windshield Glass */}
        <path
          d='M670 170 L720 172 Q742 205 752 245 L670 245 Z'
          fill='url(#glassGrad)'
          stroke='#222'
          strokeWidth='1.5'
        />
        {/* Windshield Reflection */}
        <path d='M685 176 L710 178 L688 238 L678 238 Z' fill='#ffffff' fillOpacity='0.25' />

        {/* Side Door Window */}
        <path
          d='M570 172 L655 172 L655 240 L570 240 Z'
          fill='url(#glassGrad)'
          stroke='#1a1a1a'
          strokeWidth='1.5'
          rx='3'
        />
        {/* Door Window Reflection */}
        <path d='M585 178 L605 178 L580 234 L574 234 Z' fill='#ffffff' fillOpacity='0.25' />

        {/* Door Handle */}
        <rect x='585' y='255' width='26' height='7' rx='2' fill='#4f4f4f' stroke='#111' strokeWidth='1' />

        {/* Front Headlight Cluster (Modern LED Matrix) */}
        <path
          d='M754 265 L768 288 Q765 295 750 295 L746 265 Z'
          fill='#e0f2fe'
          stroke='#38bdf8'
          strokeWidth='1.5'
        />
        <line x1='750' y1='275' x2='762' y2='275' stroke={accentColor} strokeWidth='2' />
        <circle cx='758' cy='283' r='4' fill='#38bdf8' />

        {/* Front Grille */}
        <path d='M748 296 L762 296 L758 310 L742 310 Z' fill='#111111' stroke='#333' strokeWidth='1' />
        <line x1='746' y1='301' x2='759' y2='301' stroke='#444' strokeWidth='1' />
        <line x1='744' y1='306' x2='756' y2='306' stroke='#444' strokeWidth='1' />

        {/* Side Mirror */}
        <path d='M665 195 L685 190 L685 220 L665 210 Z' fill='#1a1a1a' stroke='#333' strokeWidth='1.5' />
        <rect x='682' y='192' width='3' height='26' fill='#6e9cf5' opacity='0.7' />

        {/* Front Bumper & Fog Lights */}
        <path d='M730 310 L772 310 Q782 314 778 326 L730 326 Z' fill='#1e1e1e' stroke='#333' strokeWidth='1.5' />
        <circle cx='765' cy='318' r='3' fill='#facc15' />

        {/* Step Assist */}
        <rect x='630' y='308' width='45' height='8' rx='2' fill='#444444' />
      </g>

      {/* =========================================================
          3. WHEELS & SUSPENSION (Precision dual-axles)
         ========================================================= */}
      {/* Front Wheel Well & Mudguard */}
      <path d='M640 310 A 52 52 0 0 1 735 310' fill='none' stroke='#222222' strokeWidth='6' />

      {/* Rear Wheel Well & Mudguard */}
      <path d='M150 310 A 52 52 0 0 1 245 310' fill='none' stroke='#222222' strokeWidth='6' />
      <path d='M255 310 A 52 52 0 0 1 350 310' fill='none' stroke='#222222' strokeWidth='6' />

      {/* Front Wheel (Single) */}
      <g id='wheel-front'>
        {/* Outer Tire */}
        <circle cx='688' cy='325' r='46' fill='#181818' stroke='#0a0a0a' strokeWidth='3' />
        <circle cx='688' cy='325' r='37' fill='#242424' />
        {/* Rim */}
        <circle cx='688' cy='325' r='28' fill='url(#wheelRimGrad)' stroke='#333' strokeWidth='1.5' />
        {/* Hub & Lug Nuts */}
        <circle cx='688' cy='325' r='14' fill='#202020' />
        <circle cx='688' cy='325' r='6' fill='#a0a0a0' />
        <circle cx='688' cy='314' r='2' fill='#eee' />
        <circle cx='699' cy='325' r='2' fill='#eee' />
        <circle cx='688' cy='336' r='2' fill='#eee' />
        <circle cx='677' cy='325' r='2' fill='#eee' />
      </g>

      {/* Rear Dual Wheels */}
      <g id='wheel-rear-1'>
        <circle cx='198' cy='325' r='46' fill='#181818' stroke='#0a0a0a' strokeWidth='3' />
        <circle cx='198' cy='325' r='37' fill='#242424' />
        <circle cx='198' cy='325' r='28' fill='url(#wheelRimGrad)' stroke='#333' strokeWidth='1.5' />
        <circle cx='198' cy='325' r='14' fill='#202020' />
        <circle cx='198' cy='325' r='6' fill='#a0a0a0' />
        <circle cx='198' cy='314' r='2' fill='#eee' />
        <circle cx='209' cy='325' r='2' fill='#eee' />
        <circle cx='198' cy='336' r='2' fill='#eee' />
        <circle cx='187' cy='325' r='2' fill='#eee' />
      </g>

      <g id='wheel-rear-2'>
        <circle cx='302' cy='325' r='46' fill='#181818' stroke='#0a0a0a' strokeWidth='3' />
        <circle cx='302' cy='325' r='37' fill='#242424' />
        <circle cx='302' cy='325' r='28' fill='url(#wheelRimGrad)' stroke='#333' strokeWidth='1.5' />
        <circle cx='302' cy='325' r='14' fill='#202020' />
        <circle cx='302' cy='325' r='6' fill='#a0a0a0' />
        <circle cx='302' cy='314' r='2' fill='#eee' />
        <circle cx='313' cy='325' r='2' fill='#eee' />
        <circle cx='302' cy='336' r='2' fill='#eee' />
        <circle cx='291' cy='325' r='2' fill='#eee' />
      </g>
    </svg>
  )
}

export default TruckGraphic
