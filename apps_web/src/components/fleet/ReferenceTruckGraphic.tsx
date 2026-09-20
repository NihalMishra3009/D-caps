/**
 * Primary Vector Logistics Truck Graphic (Reference Image 4)
 * White side-view commercial semi-truck with realistic multi-compartment cargo zones (#A12, #A32, EXPRESS, #A45, #B47, #RD kg, #C78, #K90).
 */

import React from 'react'

interface ReferenceTruckGraphicProps {
  width?: number | string
  height?: number | string
  utilizationPct?: number
  selectedCompartment?: string | null
  onSelectCompartment?: (id: string) => void
  cargoSections?: {
    id: string
    code: string
    weightKg: string | number
    status?: 'LOADED' | 'EXPRESS' | 'AVAILABLE' | 'ACTIVE'
    routeTag?: string
    color?: string
  }[]
}

const DEFAULT_CARGO_SECTIONS = [
  { id: 'c1', code: '#A12', weightKg: '500 kg', status: 'LOADED', routeTag: 'FRA - AMS', color: '#ffffff' },
  { id: 'c2', code: '#A32', weightKg: '490 kg', status: 'ACTIVE', routeTag: '+490 kg', color: '#7217f5' },
  { id: 'c3', code: 'EXPRESS', weightKg: '500 kg', status: 'EXPRESS', routeTag: 'INUT #652', color: '#ffffff' },
  { id: 'c4', code: '#A45', weightKg: '500 kg', status: 'EXPRESS', routeTag: 'BRE - PRG', color: '#ffffff' },
  { id: 'c5', code: '#B47', weightKg: '94%', status: 'LOADED', routeTag: 'NY - LON', color: '#ffffff' },
  { id: 'c6', code: '#RD kg', weightKg: '89%', status: 'LOADED', routeTag: 'M/O kg', color: '#ffffff' },
  { id: 'c7', code: '#C78', weightKg: '800 kg', status: 'LOADED', routeTag: '200 kg', color: '#ffffff' },
  { id: 'c8', code: '#K90', weightKg: '200 kg', status: 'LOADED', routeTag: '#D98', color: '#ffffff' },
]

export const ReferenceTruckGraphic: React.FC<ReferenceTruckGraphicProps> = ({
  width = '100%',
  height = 'auto',
  cargoSections = DEFAULT_CARGO_SECTIONS,
}) => {
  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '10px 0' }}>
      <svg
        viewBox='0 0 1120 400'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        style={{
          width,
          height,
          maxWidth: 1060,
          minWidth: 700,
          display: 'block',
          margin: '0 auto',
          filter: 'drop-shadow(0 14px 20px rgba(0, 0, 0, 0.06))',
        }}
      >
        <defs>
          {/* Subtle Gradients */}
          <linearGradient id='refCabinGrad' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#ffffff' />
            <stop offset='70%' stopColor='#f3f3f2' />
            <stop offset='100%' stopColor='#e4e4e0' />
          </linearGradient>

          <linearGradient id='refWindshield' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#1c2331' />
            <stop offset='100%' stopColor='#0b0f19' />
          </linearGradient>

          <linearGradient id='refChassis' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='#282828' />
            <stop offset='100%' stopColor='#111111' />
          </linearGradient>

          <linearGradient id='wheelRubber' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#262626' />
            <stop offset='100%' stopColor='#121212' />
          </linearGradient>

          <linearGradient id='wheelRim' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#e8e8e8' />
            <stop offset='50%' stopColor='#b0b0b0' />
            <stop offset='100%' stopColor='#707070' />
          </linearGradient>
        </defs>

        {/* Soft Ground Shadow */}
        <ellipse cx='560' cy='350' rx='510' ry='14' fill='#000000' fillOpacity='0.12' filter='blur(8px)' />
        <ellipse cx='560' cy='348' rx='450' ry='6' fill='#000000' fillOpacity='0.18' filter='blur(3px)' />

        {/* Chassis Frame & Connection Rail */}
        <rect x='110' y='282' width='940' height='20' rx='3' fill='url(#refChassis)' stroke='#3a3a3a' strokeWidth='1.5' />
        
        {/* Air Tanks & Battery Boxes */}
        <rect x='340' y='288' width='140' height='24' rx='4' fill='#1e1e1e' stroke='#444' strokeWidth='1' />
        <rect x='510' y='290' width='90' height='22' rx='3' fill='#252525' stroke='#444' strokeWidth='1' />
        <rect x='620' y='290' width='110' height='22' rx='3' fill='#1a1a1a' stroke='#333' strokeWidth='1' />

        {/* =========================================================
            1. CABIN (White Modern European Logistics Truck Cabin)
           ========================================================= */}
        <g id='ref-cabin'>
          {/* Main Cabin Shell */}
          <path
            d='M130 282 L130 190 Q130 135 175 110 L235 110 Q255 110 260 130 L260 282 Z'
            fill='url(#refCabinGrad)'
            stroke='#cfcfca'
            strokeWidth='2'
          />

          {/* Windshield Glass */}
          <path
            d='M140 185 L180 120 Q195 120 230 120 L230 185 Z'
            fill='url(#refWindshield)'
            stroke='#222'
            strokeWidth='1.5'
          />
          {/* Windshield Reflection */}
          <path d='M150 178 L185 126 L205 126 L168 178 Z' fill='#ffffff' fillOpacity='0.15' />

          {/* Side Door Window */}
          <path
            d='M195 130 L230 130 L230 180 L195 180 Z'
            fill='url(#refWindshield)'
            stroke='#222'
            strokeWidth='1'
          />

          {/* Door Cutline & Handle */}
          <line x1='190' y1='125' x2='190' y2='278' stroke='#d8d8d4' strokeWidth='1.5' />
          <rect x='202' y='200' width='16' height='5' rx='1' fill='#444' />

          {/* Front Grille Details */}
          <rect x='132' y='205' width='12' height='60' rx='2' fill='#242424' />
          <line x1='134' y1='215' x2='142' y2='215' stroke='#555' strokeWidth='1.5' />
          <line x1='134' y1='225' x2='142' y2='225' stroke='#555' strokeWidth='1.5' />
          <line x1='134' y1='235' x2='142' y2='235' stroke='#555' strokeWidth='1.5' />
          <line x1='134' y1='245' x2='142' y2='245' stroke='#555' strokeWidth='1.5' />
          <line x1='134' y1='255' x2='142' y2='255' stroke='#555' strokeWidth='1.5' />

          {/* Headlight */}
          <path d='M132 268 L142 268 L140 278 L132 278 Z' fill='#e0f2fe' stroke='#38bdf8' strokeWidth='1' />
          <circle cx='136' cy='273' r='2' fill='#38bdf8' />

          {/* Cabin Steps */}
          <rect x='170' y='275' width='28' height='6' rx='1' fill='#333' />
          <rect x='170' y='264' width='28' height='4' rx='1' fill='#444' />
        </g>

        {/* =========================================================
            2. CARGO TRAILER BODY (Reference Image 4 Multi-Compartment Canvas)
           ========================================================= */}
        <g id='ref-cargo-trailer'>
          {/* Outer Cargo Container Wall */}
          <rect
            x='275'
            y='100'
            width='775'
            height='182'
            rx='4'
            fill='#ffffff'
            stroke='#d4d4cf'
            strokeWidth='2'
          />

          {/* Top & Bottom Structural Edge Rails */}
          <rect x='275' y='100' width='775' height='10' fill='#f0f0ee' stroke='#d4d4cf' strokeWidth='1' />
          <rect x='275' y='274' width='775' height='8' fill='#e2e2dd' stroke='#d4d4cf' strokeWidth='1' />

          {/* Multi-Compartment Segments (#A12, #A32, EXPRESS, #A45, #B47, #RD, #C78, #K90) */}
          {cargoSections.map((sec, idx) => {
            const secWidth = 775 / cargoSections.length
            const secX = 275 + idx * secWidth
            const isPurple = sec.color === '#7217f5' || sec.id === 'c2'

            return (
              <g key={sec.id}>
                {/* Vertical Divider Line */}
                {idx > 0 && (
                  <line
                    x1={secX}
                    y1='110'
                    x2={secX}
                    y2='274'
                    stroke='#e5e5e0'
                    strokeWidth='1.5'
                  />
                )}

                {/* Filled Background for Active / Purple Cell (Reference Image 4) */}
                {isPurple && (
                  <rect
                    x={secX + 1}
                    y='111'
                    width={secWidth - 2}
                    height='162'
                    fill='#7217f5'
                  />
                )}

                {/* Segment Code Tag */}
                <text
                  x={secX + secWidth / 2}
                  y='128'
                  textAnchor='middle'
                  fontSize='10'
                  fontWeight='700'
                  fill={isPurple ? '#ffffff' : '#666666'}
                  fontFamily='Inter, sans-serif'
                >
                  {sec.code}
                </text>

                {/* Subtag / Weight Diff (e.g. +490 kg or -80 kg) */}
                {sec.routeTag && (
                  <text
                    x={secX + secWidth / 2}
                    y='142'
                    textAnchor='middle'
                    fontSize='8'
                    fontWeight='500'
                    fill={isPurple ? '#e0d0ff' : '#999999'}
                    fontFamily='Inter, sans-serif'
                  >
                    {sec.routeTag}
                  </text>
                )}

                {/* Center Weight / Capacity Stat or Plus Icon */}
                {isPurple ? (
                  <g transform={`translate(${secX + secWidth / 2 - 10}, 180)`}>
                    <circle cx='10' cy='10' r='12' fill='#ffffff' fillOpacity='0.25' />
                    <text x='10' y='14' textAnchor='middle' fill='#ffffff' fontSize='14' fontWeight='bold'>+</text>
                  </g>
                ) : (
                  <text
                    x={secX + secWidth / 2}
                    y='185'
                    textAnchor='middle'
                    fontSize='12'
                    fontWeight='700'
                    fill='#181818'
                    fontFamily='Inter, sans-serif'
                  >
                    {sec.weightKg}
                  </text>
                )}

                {/* Bottom Status Tag (LOADED, EXPRESS, etc.) */}
                <text
                  x={secX + secWidth / 2}
                  y='245'
                  textAnchor='middle'
                  fontSize='9'
                  fontWeight='600'
                  fill={isPurple ? '#ffffff' : '#555555'}
                  fontFamily='Inter, sans-serif'
                  letterSpacing='0.3px'
                >
                  {sec.status || 'LOADED'}
                </text>

                {/* Bottom Sub-label (e.g. 490 kg / FRA - AMS) */}
                <text
                  x={secX + secWidth / 2}
                  y='260'
                  textAnchor='middle'
                  fontSize='8'
                  fontWeight='500'
                  fill={isPurple ? '#e0d0ff' : '#888888'}
                  fontFamily='Inter, sans-serif'
                >
                  {isPurple ? '490 kg' : sec.routeTag || 'Loaded space'}
                </text>
              </g>
            )
          })}
        </g>

        {/* =========================================================
            3. WHEELS & AXLES (Front Steering + Dual Rear Axles)
           ========================================================= */}
        {/* Front Wheel */}
        <g id='ref-wheel-front'>
          <circle cx='180' cy='300' r='38' fill='url(#wheelRubber)' stroke='#000' strokeWidth='2' />
          <circle cx='180' cy='300' r='24' fill='url(#wheelRim)' stroke='#444' strokeWidth='1' />
          <circle cx='180' cy='300' r='10' fill='#222' />
          <circle cx='180' cy='300' r='4' fill='#eee' />
        </g>

        {/* Tractor Rear Drive Wheel */}
        <g id='ref-wheel-mid'>
          <circle cx='320' cy='300' r='38' fill='url(#wheelRubber)' stroke='#000' strokeWidth='2' />
          <circle cx='320' cy='300' r='24' fill='url(#wheelRim)' stroke='#444' strokeWidth='1' />
          <circle cx='320' cy='300' r='10' fill='#222' />
          <circle cx='320' cy='300' r='4' fill='#eee' />
        </g>

        {/* Trailer Rear Dual Axle Wheels */}
        <g id='ref-wheel-rear-1'>
          <circle cx='870' cy='300' r='38' fill='url(#wheelRubber)' stroke='#000' strokeWidth='2' />
          <circle cx='870' cy='300' r='24' fill='url(#wheelRim)' stroke='#444' strokeWidth='1' />
          <circle cx='870' cy='300' r='10' fill='#222' />
          <circle cx='870' cy='300' r='4' fill='#eee' />
        </g>

        <g id='ref-wheel-rear-2'>
          <circle cx='960' cy='300' r='38' fill='url(#wheelRubber)' stroke='#000' strokeWidth='2' />
          <circle cx='960' cy='300' r='24' fill='url(#wheelRim)' stroke='#444' strokeWidth='1' />
          <circle cx='960' cy='300' r='10' fill='#222' />
          <circle cx='960' cy='300' r='4' fill='#eee' />
        </g>
      </svg>
    </div>
  )
}

export default ReferenceTruckGraphic
