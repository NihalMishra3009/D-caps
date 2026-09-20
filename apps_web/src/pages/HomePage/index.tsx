/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Grid,
  Header,
  SpaceBetween,
  StatusIndicator,
} from '@cloudscape-design/components'
import { appvars } from '../../config'
import Interactive3DMap, { type MapMarkerItem } from '../../components/MapComponent/Interactive3DMap'
import Common from '../../api/Common'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [markers, setMarkers] = useState<MapMarkerItem[]>([])

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        const [custRes, whRes] = await Promise.allSettled([
          Common.commonGetRequest(appvars.URL.CUSTOMER_LOCATION),
          Common.commonGetRequest(appvars.URL.WAREHOUSE),
        ])

        const list: MapMarkerItem[] = []

        if (whRes.status === 'fulfilled' && whRes.value?.data?.Items) {
          whRes.value.data.Items.forEach((w: any, idx: number) => {
            if (w.latitude && w.longitude) {
              list.push({
                id: `wh-${w.Id || idx}`,
                latitude: Number(w.latitude),
                longitude: Number(w.longitude),
                title: w.warehouseName || `Warehouse ${w.warehouseCode}`,
                subtitle: w.address || 'Central Distribution Hub',
                type: 'warehouse',
              })
            }
          })
        }

        if (custRes.status === 'fulfilled' && custRes.value?.data?.Items) {
          custRes.value.data.Items.forEach((c: any, idx: number) => {
            if (c.latitude && c.longitude) {
              list.push({
                id: `cust-${c.Id || idx}`,
                latitude: Number(c.latitude),
                longitude: Number(c.longitude),
                title: c.deliveryName || `Hospital ${c.deliveryCode}`,
                subtitle: c.address || 'Hospital / Clinic Location',
                type: 'customer',
              })
            }
          })
        }

        setMarkers(list)
      } catch (e) {
        console.error('Error fetching home map markers', e)
      }
    }

    loadOverviewData()
  }, [])

  return (
    <SpaceBetween size='l'>
      <Container
        header={
          <Header
            variant='h1'
            description='Plan dispatches across Navi Mumbai with constraint-based vehicle routing (VRPTW) and road optimization.'
            actions={
              <SpaceBetween direction='horizontal' size='xs'>
                <Button variant='primary' onClick={() => navigate(`/${appvars.URL.SOLVER_JOB}`)}>
                  Launch Optimizer
                </Button>
                <Button onClick={() => navigate(`/${appvars.URL.CUSTOMER_LOCATION}`)}>
                  Customer Locations
                </Button>
              </SpaceBetween>
            }
          >
            Navi Mumbai Medical Delivery Route Optimizer
          </Header>
        }
      >
        <Box variant='p'>
          Welcome to the Next-Day Medical Supply Route Optimization platform. Solve multi-objective Vehicle Routing Problems with Time Windows (VRPTW) using GraphHopper road graphs and OptaPlanner constraint algorithms.
        </Box>
      </Container>

      {/* 3D Interactive Tactical Map Preview */}
      <Container header={<Header variant='h2'>Live 3D Metropolitan Logistics Network</Header>}>
        <Interactive3DMap
          markers={markers}
          center={[73.0297, 19.033]}
          zoom={12.8}
          pitch={58}
          bearing={-20}
          height={480}
          title='Navi Mumbai Active Fleet & Hub Radar'
          subtitle='3D Building Extrusions & Three.js WebGL Tactical Coordinates'
        />
      </Container>

      <div>
        <Header variant='h2'>Operational Network Overview</Header>
        <div style={{ marginTop: 12 }}>
          <Grid
            gridDefinition={[
              { colspan: { default: 12, s: 6, m: 3 } },
              { colspan: { default: 12, s: 6, m: 3 } },
              { colspan: { default: 12, s: 6, m: 3 } },
              { colspan: { default: 12, s: 6, m: 3 } },
            ]}
          >
            <Container>
              <Box variant='awsui-key-label'>Hospitals & Locations</Box>
              <Box variant='awsui-value-large'>17</Box>
              <StatusIndicator type='success'>All Priority Groups Active</StatusIndicator>
            </Container>

            <Container>
              <Box variant='awsui-key-label'>Active Fleet</Box>
              <Box variant='awsui-value-large'>8</Box>
              <StatusIndicator type='info'>1T, 2.5T & 5T Capacity</StatusIndicator>
            </Container>

            <Container>
              <Box variant='awsui-key-label'>Scheduled Consignments</Box>
              <Box variant='awsui-value-large'>17</Box>
              <StatusIndicator type='success'>100% Time-Window Fit</StatusIndicator>
            </Container>

            <Container>
              <Box variant='awsui-key-label'>Est. Route Distance</Box>
              <Box variant='awsui-value-large'>58.4 km</Box>
              <StatusIndicator type='success'>OptaPlanner Optimized</StatusIndicator>
            </Container>
          </Grid>
        </div>
      </div>

      <Grid gridDefinition={[{ colspan: { default: 12, m: 6 } }, { colspan: { default: 12, m: 6 } }]}>
        <Container header={<Header variant='h2'>Dispatch Constraints</Header>}>
          <SpaceBetween size='m'>
            <Box variant='p'>
              The OptaPlanner solver balances hard, medium, and soft delivery constraints:
            </Box>
            <ul>
              <li><strong>Time-Window Matching:</strong> Orders are assigned to vehicles operating within matching time bands.</li>
              <li><strong>Capacity & Weight Guard:</strong> Automatic saturation checks prevent vehicle overloading.</li>
              <li><strong>Fleet Prioritization:</strong> Owned fleet is scheduled before contracted capacity.</li>
              <li><strong>Multi-Order Consolidation:</strong> Multiple consignments for the same medical center share single deliveries.</li>
            </ul>
          </SpaceBetween>
        </Container>

        <Container header={<Header variant='h2'>Road Routing & OpenStreetMap</Header>}>
          <SpaceBetween size='m'>
            <Box variant='p'>
              Built on GraphHopper with OpenStreetMap road data for realistic city routing:
            </Box>
            <ul>
              <li><strong>Exact Road Topology:</strong> Real driving distances calculated on city road networks.</li>
              <li><strong>Precalculated Distance Matrix:</strong> Fast convergence via cached matrix computation.</li>
              <li><strong>Interactive Map:</strong> Route visualization with turn-by-turn polyline decoding.</li>
            </ul>
          </SpaceBetween>
        </Container>
      </Grid>
    </SpaceBetween>
  )
}

export default HomePage
