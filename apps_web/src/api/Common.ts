/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import * as polyline from '@mapbox/polyline'
import roadRoutesData from './roadRoutes.json'

// Initial Seed Data for Local Offline Mode (using standard casing `Id` and `id`)
// Navi Mumbai Warehouses / Logistics Hubs
const initialWarehouses = [
  {
    Id: 'wh-turbhe-central',
    id: 'wh-turbhe-central',
    warehouseCode: '95001200',
    warehouseName: 'Navi Mumbai Central Medical Distribution Hub',
    address: 'MIDC Industrial Area, Turbhe, Navi Mumbai, Maharashtra 400705',
    latitude: 19.0674,
    longitude: 73.0205,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'wh-vashi-depot',
    id: 'wh-vashi-depot',
    warehouseCode: '95001300',
    warehouseName: 'Vashi Medical Cold-Chain Depot',
    address: 'Sector 19, APMC Complex, Vashi, Navi Mumbai, Maharashtra 400703',
    latitude: 19.0771,
    longitude: 72.9986,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'wh-panvel-hub',
    id: 'wh-panvel-hub',
    warehouseCode: '95001400',
    warehouseName: 'Panvel Express Logistics Hub',
    address: 'Old Mumbai-Pune Highway, Panvel, Navi Mumbai, Maharashtra 410206',
    latitude: 18.9894,
    longitude: 73.1175,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
]

// Navi Mumbai & MMR Medical Customer Locations (Hospitals, Clinics, Care Centres)
const initialCustomerLocations = [
  {
    Id: 'loc-wh-central',
    id: 'loc-wh-central',
    warehouseCode: '95001200',
    deliveryCode: '95001200',
    deliveryName: 'Navi Mumbai Central Medical Hub (Origin)',
    address: 'MIDC Industrial Area, Turbhe, Navi Mumbai',
    latitude: 19.0674,
    longitude: 73.02043,
    deliveryTimeGroup: '0',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'loc-vashi-mgmt',
    id: 'loc-vashi-mgmt',
    warehouseCode: '95001200',
    deliveryCode: '10000010',
    deliveryName: 'Fortis Hiranandani Hospital (Emergency)',
    address: 'Mini Sea Shore Road, Sector 10A, Vashi, Navi Mumbai',
    latitude: 19.08354,
    longitude: 72.99902,
    deliveryTimeGroup: '1',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'loc-apollo-belapur',
    id: 'loc-apollo-belapur',
    warehouseCode: '95001200',
    deliveryCode: '10000020',
    deliveryName: 'Apollo Hospitals Navi Mumbai',
    address: 'Plot # 13, Parsik Hill Rd, Sector 23, CBD Belapur, Navi Mumbai',
    latitude: 19.00600,
    longitude: 73.01762,
    deliveryTimeGroup: '1',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'loc-mgm-vashi',
    id: 'loc-mgm-vashi',
    warehouseCode: '95001200',
    deliveryCode: '10000030',
    deliveryName: 'MGM Hospital & Research Centre',
    address: 'Sector 3, Vashi, Navi Mumbai',
    latitude: 19.03509,
    longitude: 73.08192,
    deliveryTimeGroup: '1',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'loc-reliance-kopar',
    id: 'loc-reliance-kopar',
    warehouseCode: '95001200',
    deliveryCode: '10000040',
    deliveryName: 'Dhirubhai Ambani Life Science Centre',
    address: 'Thane-Belapur Road, Kopar Khairane, Navi Mumbai',
    latitude: 19.1124,
    longitude: 73.0116,
    deliveryTimeGroup: '1',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'loc-actrec-kharghar',
    id: 'loc-actrec-kharghar',
    warehouseCode: '95001200',
    deliveryCode: '10000050',
    deliveryName: 'Tata ACTREC Cancer Research Centre',
    address: 'Sector 22, Kharghar, Navi Mumbai',
    latitude: 19.0494,
    longitude: 73.0682,
    deliveryTimeGroup: '1',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'loc-terana-nerul',
    id: 'loc-terana-nerul',
    warehouseCode: '95001200',
    deliveryCode: '10000060',
    deliveryName: 'Terna Speciality Hospital & Research',
    address: 'Sector 22, Phase II, Nerul West, Navi Mumbai',
    latitude: 19.0345,
    longitude: 73.0189,
    deliveryTimeGroup: '1',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'loc-seawoods-grand',
    id: 'loc-seawoods-grand',
    warehouseCode: '95001200',
    deliveryCode: '10000070',
    deliveryName: 'Seawoods Advanced Diagnostics Institute',
    address: 'Sector 40, Seawoods West, Navi Mumbai',
    latitude: 19.0146,
    longitude: 73.0163,
    deliveryTimeGroup: '1',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'loc-kharghar-mitra',
    id: 'loc-kharghar-mitra',
    warehouseCode: '95001200',
    deliveryCode: '10000080',
    deliveryName: 'Motherhood Hospital Kharghar',
    address: 'Sector 7, Kharghar, Navi Mumbai',
    latitude: 19.0336,
    longitude: 73.0645,
    deliveryTimeGroup: '2',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'loc-kamothe-lifeline',
    id: 'loc-kamothe-lifeline',
    warehouseCode: '95001200',
    deliveryCode: '10000090',
    deliveryName: 'Lifeline Multispeciality Hospital',
    address: 'Sector 36, Kamothe, Navi Mumbai',
    latitude: 19.0178,
    longitude: 73.0894,
    deliveryTimeGroup: '2',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'loc-panvel-lifecare',
    id: 'loc-panvel-lifecare',
    warehouseCode: '95001200',
    deliveryCode: '10000100',
    deliveryName: 'Panvel Advanced Trauma Care Centre',
    address: 'Near Orion Mall, Panvel, Navi Mumbai',
    latitude: 18.9928,
    longitude: 73.1205,
    deliveryTimeGroup: '2',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'loc-airoli-indravati',
    id: 'loc-airoli-indravati',
    warehouseCode: '95001200',
    deliveryCode: '10000110',
    deliveryName: 'Indravati Hospital & Research Centre',
    address: 'Sector 3, Airoli, Navi Mumbai',
    latitude: 19.1558,
    longitude: 72.9984,
    deliveryTimeGroup: '2',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'loc-ghansoli-surya',
    id: 'loc-ghansoli-surya',
    warehouseCode: '95001200',
    deliveryCode: '10000120',
    deliveryName: 'Surya Diagnostic & Healthcare Clinic',
    address: 'Sector 8, Ghansoli, Navi Mumbai',
    latitude: 19.1245,
    longitude: 73.0038,
    deliveryTimeGroup: '2',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'loc-sanpada-millennium',
    id: 'loc-sanpada-millennium',
    warehouseCode: '95001200',
    deliveryCode: '10000130',
    deliveryName: 'Millennium Care Diagnostic Hub',
    address: 'Sector 4, Sanpada, Navi Mumbai',
    latitude: 19.0628,
    longitude: 73.0112,
    deliveryTimeGroup: '1',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'loc-juinagar-city',
    id: 'loc-juinagar-city',
    warehouseCode: '95001200',
    deliveryCode: '10000140',
    deliveryName: 'Juinagar Community Healthcare Centre',
    address: 'Sector 23, Juinagar East, Navi Mumbai',
    latitude: 19.0512,
    longitude: 73.0234,
    deliveryTimeGroup: '2',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'loc-kalamboli-metro',
    id: 'loc-kalamboli-metro',
    warehouseCode: '95001200',
    deliveryCode: '10000150',
    deliveryName: 'Metro Hospital & Emergency Centre',
    address: 'Sector 1E, Kalamboli, Navi Mumbai',
    latitude: 19.0305,
    longitude: 73.1042,
    deliveryTimeGroup: '2',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'loc-rabale-healthcare',
    id: 'loc-rabale-healthcare',
    warehouseCode: '95001200',
    deliveryCode: '10000160',
    deliveryName: 'Rabale Industrial Health Clinic',
    address: 'Sector 8, MIDC Rabale, Navi Mumbai',
    latitude: 19.1362,
    longitude: 73.0075,
    deliveryTimeGroup: '1',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
]

// Navi Mumbai Synthetic Vehicle Fleet (MH-46 Registered)
const initialVehicles = [
  {
    Id: 'veh-own-01',
    id: 'veh-own-01',
    warehouseCode: '95001200',
    carNo: 'MH-46-OWN-101',
    carGrade: '1 Ton',
    maxWeight: 8000,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'veh-own-02',
    id: 'veh-own-02',
    warehouseCode: '95001200',
    carNo: 'MH-46-OWN-102',
    carGrade: '1 Ton',
    maxWeight: 8000,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'veh-own-03',
    id: 'veh-own-03',
    warehouseCode: '95001200',
    carNo: 'MH-46-OWN-103',
    carGrade: '2.5 Ton',
    maxWeight: 20000,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'veh-own-04',
    id: 'veh-own-04',
    warehouseCode: '95001200',
    carNo: 'MH-46-OWN-104',
    carGrade: '2.5 Ton',
    maxWeight: 20000,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'veh-own-05',
    id: 'veh-own-05',
    warehouseCode: '95001200',
    carNo: 'MH-46-OWN-105',
    carGrade: '5 Ton',
    maxWeight: 40000,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'veh-con-01',
    id: 'veh-con-01',
    warehouseCode: '95001200',
    carNo: 'MH-46-CON-201',
    carGrade: '1 Ton',
    maxWeight: 8000,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'veh-con-02',
    id: 'veh-con-02',
    warehouseCode: '95001200',
    carNo: 'MH-46-CON-202',
    carGrade: '2.5 Ton',
    maxWeight: 20000,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'veh-con-03',
    id: 'veh-con-03',
    warehouseCode: '95001200',
    carNo: 'MH-46-CON-203',
    carGrade: '5 Ton',
    maxWeight: 40000,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
]

// Navi Mumbai Medical Supply Dispatch Orders (Consolidatable across hubs)
const initialOrders = [
  {
    Id: 'ord-mum-001',
    id: 'ord-mum-001',
    orderDate: '20260920',
    warehouseCode: '95001200',
    deliveryCode: '10000010',
    orderSeq: '1',
    volume: 450,
    customerName: 'Fortis Hiranandani Hospital (Emergency)',
    status: 'DISPATCHED',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'ord-mum-002',
    id: 'ord-mum-002',
    orderDate: '20260920',
    warehouseCode: '95001200',
    deliveryCode: '10000010',
    orderSeq: '2',
    volume: 320,
    customerName: 'Fortis Hiranandani Hospital (Emergency)',
    status: 'DISPATCHED',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'ord-mum-003',
    id: 'ord-mum-003',
    orderDate: '20260920',
    warehouseCode: '95001200',
    deliveryCode: '10000020',
    orderSeq: '3',
    volume: 1250,
    customerName: 'Apollo Hospitals Navi Mumbai',
    status: 'DISPATCHED',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'ord-mum-004',
    id: 'ord-mum-004',
    orderDate: '20260920',
    warehouseCode: '95001200',
    deliveryCode: '10000030',
    orderSeq: '4',
    volume: 780,
    customerName: 'MGM Hospital & Research Centre',
    status: 'DISPATCHED',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'ord-mum-005',
    id: 'ord-mum-005',
    orderDate: '20260920',
    warehouseCode: '95001200',
    deliveryCode: '10000040',
    orderSeq: '5',
    volume: 950,
    customerName: 'Dhirubhai Ambani Life Science Centre',
    status: 'DISPATCHED',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'ord-mum-006',
    id: 'ord-mum-006',
    orderDate: '20260920',
    warehouseCode: '95001200',
    deliveryCode: '10000050',
    orderSeq: '6',
    volume: 1800,
    customerName: 'Tata ACTREC Cancer Research Centre',
    status: 'DISPATCHED',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'ord-mum-007',
    id: 'ord-mum-007',
    orderDate: '20260920',
    warehouseCode: '95001200',
    deliveryCode: '10000060',
    orderSeq: '7',
    volume: 620,
    customerName: 'Terna Speciality Hospital & Research',
    status: 'DISPATCHED',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'ord-mum-008',
    id: 'ord-mum-008',
    orderDate: '20260920',
    warehouseCode: '95001200',
    deliveryCode: '10000070',
    orderSeq: '8',
    volume: 410,
    customerName: 'Seawoods Advanced Diagnostics Institute',
    status: 'DISPATCHED',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'ord-mum-009',
    id: 'ord-mum-009',
    orderDate: '20260920',
    warehouseCode: '95001200',
    deliveryCode: '10000080',
    orderSeq: '9',
    volume: 530,
    customerName: 'Motherhood Hospital Kharghar',
    status: 'DISPATCHED',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'ord-mum-010',
    id: 'ord-mum-010',
    orderDate: '20260920',
    warehouseCode: '95001200',
    deliveryCode: '10000090',
    orderSeq: '10',
    volume: 1100,
    customerName: 'Lifeline Multispeciality Hospital',
    status: 'DISPATCHED',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'ord-mum-011',
    id: 'ord-mum-011',
    orderDate: '20260920',
    warehouseCode: '95001200',
    deliveryCode: '10000100',
    orderSeq: '11',
    volume: 1400,
    customerName: 'Panvel Advanced Trauma Care Centre',
    status: 'DISPATCHED',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'ord-mum-012',
    id: 'ord-mum-012',
    orderDate: '20260920',
    warehouseCode: '95001200',
    deliveryCode: '10000110',
    orderSeq: '12',
    volume: 850,
    customerName: 'Indravati Hospital & Research Centre',
    status: 'DISPATCHED',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'ord-mum-013',
    id: 'ord-mum-013',
    orderDate: '20260920',
    warehouseCode: '95001200',
    deliveryCode: '10000120',
    orderSeq: '13',
    volume: 380,
    customerName: 'Surya Diagnostic & Healthcare Clinic',
    status: 'DISPATCHED',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'ord-mum-014',
    id: 'ord-mum-014',
    orderDate: '20260920',
    warehouseCode: '95001200',
    deliveryCode: '10000130',
    orderSeq: '14',
    volume: 490,
    customerName: 'Millennium Care Diagnostic Hub',
    status: 'DISPATCHED',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'ord-mum-015',
    id: 'ord-mum-015',
    orderDate: '20260920',
    warehouseCode: '95001200',
    deliveryCode: '10000140',
    orderSeq: '15',
    volume: 670,
    customerName: 'Juinagar Community Healthcare Centre',
    status: 'DISPATCHED',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'ord-mum-016',
    id: 'ord-mum-016',
    orderDate: '20260920',
    warehouseCode: '95001200',
    deliveryCode: '10000150',
    orderSeq: '16',
    volume: 920,
    customerName: 'Metro Hospital & Emergency Centre',
    status: 'DISPATCHED',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    Id: 'ord-mum-017',
    id: 'ord-mum-017',
    orderDate: '20260920',
    warehouseCode: '95001200',
    deliveryCode: '10000160',
    orderSeq: '17',
    volume: 710,
    customerName: 'Rabale Industrial Health Clinic',
    status: 'DISPATCHED',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
]

const initialDistanceCaches = [
  {
    Id: 'cache-95001200',
    id: 'cache-95001200',
    warehouseCode: '95001200',
    status: 'SUCCESS',
    dimension: 17,
    lastCalculated: new Date().toISOString(),
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
]

const initialSolverJobs = [
  {
    Id: 'job-mum-01',
    id: 'job-mum-01',
    jobId: 'job-mum-01',
    orderDate: '20260920',
    warehouseCode: '95001200',
    status: 'COMPLETED',
    totalDistanceMeters: 58400,
    totalTimeSeconds: 6920,
    assignedVehiclesCount: 5,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
]

// Helper to get or init localStorage collection (with auto-migration if legacy Seoul data detected)
const getCollection = (key: string, initial: any[]): any[] => {
  try {
    const raw = localStorage.getItem(`local_db_${key}`)
    if (!raw) {
      localStorage.setItem(`local_db_${key}`, JSON.stringify(initial))
      return initial
    }
    const parsed = JSON.parse(raw)
    
    // Check if legacy Seoul data exists; if so, reset with Navi Mumbai data
    const isLegacyData = parsed.some((item: any) => 
      (item.address && (item.address.includes('Seoul') || item.address.includes('Korea'))) ||
      (item.deliveryName && item.deliveryName.includes('Seoul')) ||
      (item.latitude && item.latitude > 30) // Seoul is ~37.5, Mumbai is ~19.0
    )

    if (isLegacyData) {
      localStorage.setItem(`local_db_${key}`, JSON.stringify(initial))
      return initial
    }

    // ensure all have both Id and id
    return parsed.map((item: any) => ({
      ...item,
      Id: item.Id || item.id,
      id: item.Id || item.id,
      createdAt: item.createdAt || Date.now(),
      updatedAt: item.updatedAt || Date.now(),
    }))
  } catch {
    return initial
  }
}

const saveCollection = (key: string, items: any[]) => {
  try {
    localStorage.setItem(`local_db_${key}`, JSON.stringify(items))
  } catch (e) {
    console.error('Failed to save to localStorage', e)
  }
}

const getEntityKeyFromPath = (path: string): string => {
  if (path.includes('customer-location')) return 'customer_locations'
  if (path.includes('warehouse')) return 'warehouses'
  if (path.includes('vehicle')) return 'vehicles'
  if (path.includes('order')) return 'orders'
  if (path.includes('distance-cache') || path.includes('distancecache') || path.includes('dist-cache')) return 'distance_cache'
  if (path.includes('solver-job') || path.includes('solverjob') || path.includes('delivery-job')) return 'solver_jobs'
  return 'general'
}

const getInitialData = (key: string): any[] => {
  switch (key) {
    case 'customer_locations':
      return initialCustomerLocations
    case 'warehouses':
      return initialWarehouses
    case 'vehicles':
      return initialVehicles
    case 'orders':
      return initialOrders
    case 'distance_cache':
      return initialDistanceCaches
    case 'solver_jobs':
      return initialSolverJobs
    default:
      return []
  }
}

const commonGetRequest = async (path: string, _queryStringParameters?: unknown): Promise<any> => {
  const entityKey = getEntityKeyFromPath(path)
  const items = getCollection(entityKey, getInitialData(entityKey))

  // Single item lookup by path ID (e.g., /api/web/vehicle/148bf5ed-... or /api/web/warehouse/efe96b73-...)
  const parts = path.split('/').filter(Boolean)
  const lastPart = parts[parts.length - 1]

  if (path.includes('delivery-solver-job') || path.includes('delivery-job')) {
    const vehicles = getCollection('vehicles', initialVehicles)
    const locations = getCollection('customer_locations', initialCustomerLocations)
    const wh = getCollection('warehouses', initialWarehouses)[0] || initialWarehouses[0]

    const vehicleDeliveryJobs = vehicles.slice(0, 5).map((v: any, vIdx: number) => {
      const assignedLocs = locations.slice(vIdx * 3 + 1, vIdx * 3 + 4)
      const segments = [
        {
          deliveryCode: wh.warehouseCode,
          deliveryName: `${wh.warehouseName} (Depot)`,
          deliveryTimeGroup: '0',
          demands: 0,
          segmentType: 'TO_DESTINATION',
          address: wh.address,
          latitude: wh.latitude,
          longitude: wh.longitude,
          from: { lat: wh.latitude, long: wh.longitude, latitude: wh.latitude, longitude: wh.longitude },
          to: assignedLocs[0]
            ? { lat: assignedLocs[0].latitude, long: assignedLocs[0].longitude, latitude: assignedLocs[0].latitude, longitude: assignedLocs[0].longitude }
            : { lat: wh.latitude, long: wh.longitude, latitude: wh.latitude, longitude: wh.longitude },
        },
        ...assignedLocs.map((loc: any, lIdx: number) => ({
          deliveryCode: loc.deliveryCode,
          deliveryName: loc.deliveryName,
          deliveryTimeGroup: loc.deliveryTimeGroup || '1',
          demands: 250 + lIdx * 120,
          segmentType: 'TO_DESTINATION',
          address: loc.address,
          latitude: loc.latitude,
          longitude: loc.longitude,
          from: { lat: loc.latitude, long: loc.longitude, latitude: loc.latitude, longitude: loc.longitude },
          to: assignedLocs[lIdx + 1]
            ? { lat: assignedLocs[lIdx + 1].latitude, long: assignedLocs[lIdx + 1].longitude, latitude: assignedLocs[lIdx + 1].latitude, longitude: assignedLocs[lIdx + 1].longitude }
            : { lat: wh.latitude, long: wh.longitude, latitude: wh.latitude, longitude: wh.longitude },
        })),
      ]

      const precomputed = (roadRoutesData as Record<string, any>)[v.carNo]

      let pointsEncoded = precomputed?.polyline || ''
      const distanceMeters = precomputed?.distance || 14200 + vIdx * 2800
      const durationSeconds = precomputed?.duration || 1620 + vIdx * 350

      const enrichedSegments = segments.map((seg: any, sIdx: number) => {
        const leg = precomputed?.legs?.[sIdx]
        return {
          ...seg,
          route: {
            pointsEncoded: leg?.polyline || '',
            distance: { value: leg?.distance || 8500, unit: 'm' },
            time: { value: leg?.duration || 600, unit: 'sec' },
          },
        }
      })

      if (!pointsEncoded) {
        const routePoints: [number, number][] = []
        segments.forEach((seg: any, sIdx: number) => {
          if (sIdx === 0 && seg.from?.lat && seg.from?.long) {
            routePoints.push([Number(seg.from.lat), Number(seg.from.long)])
          }
          if (seg.to?.lat && seg.to?.long) {
            routePoints.push([Number(seg.to.lat), Number(seg.to.long)])
          }
        })

        try {
          pointsEncoded = polyline.encode(routePoints)
        } catch (e) {
          console.warn('Could not encode polyline for mock delivery job', e)
        }
      }

      return {
        Id: `del-job-${v.carNo || vIdx}`,
        id: `del-job-${v.carNo || vIdx}`,
        carNo: v.carNo,
        deliveryTimeGroup: v.deliveryTimeGroup || '1',
        loadCapacity: 920 + vIdx * 250,
        maxCapacity: v.maxCapacity || 2500,
        orderCount: segments.length - 1,
        segments: enrichedSegments,
        route: {
          pointsEncoded: pointsEncoded,
          distanceMeters: distanceMeters,
          durationSeconds: durationSeconds,
        },
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now(),
      }
    })

    return {
      data: {
        Items: vehicleDeliveryJobs,
        Count: vehicleDeliveryJobs.length,
      },
    }
  }

  const isListRequest =
    lastPart === 'list' ||
    lastPart === entityKey ||
    path.endsWith('customer-location') ||
    path.endsWith('warehouse') ||
    path.endsWith('vehicle') ||
    path.endsWith('order') ||
    path.endsWith('distance-cache') ||
    path.endsWith('dist-cache') ||
    path.endsWith('solver-job')

  if (!isListRequest && parts.length >= 1) {
    const found = items.find(
      (i: any) =>
        i.Id === lastPart ||
        i.id === lastPart ||
        i.warehouseCode === lastPart ||
        i.carNo === lastPart ||
        i.deliveryCode === lastPart,
    )
    return { data: { Item: found || items[0] } }
  }

  return {
    data: {
      Items: items,
      Count: items.length,
    },
  }
}

const commonPostRequest = async (path: string, body: any, _queryStringParameters?: unknown): Promise<any> => {
  const entityKey = getEntityKeyFromPath(path)
  const items = getCollection(entityKey, getInitialData(entityKey))
  const uid = body.Id || body.id || (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : 'id-' + Date.now())
  const newItem = {
    ...body,
    Id: uid,
    id: uid,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  items.unshift(newItem)
  saveCollection(entityKey, items)
  return { data: { Item: newItem } }
}

const commonPutRequest = async (path: string, body: any, _queryStringParameters?: unknown): Promise<any> => {
  const entityKey = getEntityKeyFromPath(path)
  let items = getCollection(entityKey, getInitialData(entityKey))
  const targetId = body.Id || body.id || body.warehouseCode
  items = items.map((i: any) =>
    (i.Id === targetId || i.id === targetId || i.warehouseCode === targetId)
      ? { ...i, ...body, Id: i.Id || targetId, id: i.id || targetId, updatedAt: Date.now() }
      : i,
  )
  saveCollection(entityKey, items)
  return { data: { Item: body } }
}

const commonDeleteRequest = async (path: string, _queryStringParameters?: unknown): Promise<any> => {
  const entityKey = getEntityKeyFromPath(path)
  const parts = path.split('/').filter(Boolean)
  const idToDelete = parts[parts.length - 1]
  let items = getCollection(entityKey, getInitialData(entityKey))
  items = items.filter((i: any) => i.Id !== idToDelete && i.id !== idToDelete && i.warehouseCode !== idToDelete)
  saveCollection(entityKey, items)
  return { data: { success: true } }
}

const commonPatchRequest = async (path: string, body: unknown, queryStringParameters?: unknown): Promise<any> => {
  return commonPutRequest(path, body, queryStringParameters)
}

export default {
  commonGetRequest,
  commonPostRequest,
  commonPutRequest,
  commonPatchRequest,
  commonDeleteRequest,
}
