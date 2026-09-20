#!/bin/bash

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

set -euo pipefail

# Account info (reads from env or defaults)
PROFILE=${AWS_PROFILE:-}
REGION=${AWS_REGION:-us-east-1}

PROFILE_OPT=""
if [ -n "$PROFILE" ]; then
  PROFILE_OPT="--profile $PROFILE"
fi

ACCOUNT_ID=$(aws sts get-caller-identity $PROFILE_OPT --region $REGION --output json | jq .Account --raw-output)

# DynamoDB table names from SSM (matches config/default.yml parameterStoreKeys)
DDB_WAREHOUSE=$(aws ssm get-parameter $PROFILE_OPT --region $REGION --name /DevProto/Ddb/Warehouses/TableName | jq --raw-output ".Parameter.Value")
DDB_CUSTOMER_LOCATIONS=$(aws ssm get-parameter $PROFILE_OPT --region $REGION --name /DevProto/Ddb/CustomerLocations/TableName | jq --raw-output ".Parameter.Value")
DDB_VEHICLES=$(aws ssm get-parameter $PROFILE_OPT --region $REGION --name /DevProto/Ddb/Vehicles/TableName | jq --raw-output ".Parameter.Value")

# Upload data
echo "-----------------------------"
echo "Upload master Data"
echo "-----------------------------"
echo "> region  : $REGION"
echo "> account : $ACCOUNT_ID"
echo ""

echo "  [1] Warehouse data ..."
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_WAREHOUSE --item '{"Id":{"S":"wh-turbhe-central"},"warehouseCode":{"S":"95001200"},"warehouseName":{"S":"Navi Mumbai Central Medical Distribution Hub"},"address":{"S":"MIDC Industrial Area, Turbhe, Navi Mumbai, Maharashtra 400705"},"latitude":{"N":"19.0674"},"longitude":{"N":"73.0205"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_WAREHOUSE --item '{"Id":{"S":"wh-vashi-depot"},"warehouseCode":{"S":"95001300"},"warehouseName":{"S":"Vashi Medical Cold-Chain Depot"},"address":{"S":"Sector 19, APMC Complex, Vashi, Navi Mumbai, Maharashtra 400703"},"latitude":{"N":"19.0771"},"longitude":{"N":"72.9986"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_WAREHOUSE --item '{"Id":{"S":"wh-panvel-hub"},"warehouseCode":{"S":"95001400"},"warehouseName":{"S":"Panvel Express Logistics Hub"},"address":{"S":"Old Mumbai-Pune Highway, Panvel, Navi Mumbai, Maharashtra 410206"},"latitude":{"N":"18.9894"},"longitude":{"N":"73.1175"}}'

echo "  [2] Customer Location data ..."
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_CUSTOMER_LOCATIONS --item '{"Id":{"S":"loc-wh-central"},"warehouseCode":{"S":"95001200"},"deliveryCode":{"S":"95001200"},"deliveryName":{"S":"Navi Mumbai Central Medical Hub (Origin)"},"address":{"S":"MIDC Turbhe, Navi Mumbai"},"latitude":{"N":"19.0674"},"longitude":{"N":"73.0205"},"deliveryTimeGroup":{"S":"0"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_CUSTOMER_LOCATIONS --item '{"Id":{"S":"loc-vashi-mgmt"},"warehouseCode":{"S":"95001200"},"deliveryCode":{"S":"10000010"},"deliveryName":{"S":"Fortis Hiranandani Hospital (Emergency)"},"address":{"S":"Sector 10A, Vashi, Navi Mumbai"},"latitude":{"N":"19.0784"},"longitude":{"N":"72.9992"},"deliveryTimeGroup":{"S":"1"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_CUSTOMER_LOCATIONS --item '{"Id":{"S":"loc-apollo-belapur"},"warehouseCode":{"S":"95001200"},"deliveryCode":{"S":"10000020"},"deliveryName":{"S":"Apollo Hospitals Navi Mumbai"},"address":{"S":"Sector 23, CBD Belapur, Navi Mumbai"},"latitude":{"N":"19.0205"},"longitude":{"N":"73.0384"},"deliveryTimeGroup":{"S":"1"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_CUSTOMER_LOCATIONS --item '{"Id":{"S":"loc-mgm-vashi"},"warehouseCode":{"S":"95001200"},"deliveryCode":{"S":"10000030"},"deliveryName":{"S":"MGM Hospital & Research Centre"},"address":{"S":"Sector 3, Vashi, Navi Mumbai"},"latitude":{"N":"19.0739"},"longitude":{"N":"72.9961"},"deliveryTimeGroup":{"S":"1"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_CUSTOMER_LOCATIONS --item '{"Id":{"S":"loc-reliance-kopar"},"warehouseCode":{"S":"95001200"},"deliveryCode":{"S":"10000040"},"deliveryName":{"S":"Dhirubhai Ambani Life Science Centre"},"address":{"S":"Thane-Belapur Road, Kopar Khairane, Navi Mumbai"},"latitude":{"N":"19.1124"},"longitude":{"N":"73.0116"},"deliveryTimeGroup":{"S":"1"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_CUSTOMER_LOCATIONS --item '{"Id":{"S":"loc-actrec-kharghar"},"warehouseCode":{"S":"95001200"},"deliveryCode":{"S":"10000050"},"deliveryName":{"S":"Tata ACTREC Cancer Research Centre"},"address":{"S":"Sector 22, Kharghar, Navi Mumbai"},"latitude":{"N":"19.0494"},"longitude":{"N":"73.0682"},"deliveryTimeGroup":{"S":"1"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_CUSTOMER_LOCATIONS --item '{"Id":{"S":"loc-terana-nerul"},"warehouseCode":{"S":"95001200"},"deliveryCode":{"S":"10000060"},"deliveryName":{"S":"Terna Speciality Hospital & Research"},"address":{"S":"Sector 22, Nerul West, Navi Mumbai"},"latitude":{"N":"19.0345"},"longitude":{"N":"73.0189"},"deliveryTimeGroup":{"S":"1"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_CUSTOMER_LOCATIONS --item '{"Id":{"S":"loc-seawoods-grand"},"warehouseCode":{"S":"95001200"},"deliveryCode":{"S":"10000070"},"deliveryName":{"S":"Seawoods Advanced Diagnostics Institute"},"address":{"S":"Sector 40, Seawoods West, Navi Mumbai"},"latitude":{"N":"19.0146"},"longitude":{"N":"73.0163"},"deliveryTimeGroup":{"S":"1"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_CUSTOMER_LOCATIONS --item '{"Id":{"S":"loc-kharghar-mitra"},"warehouseCode":{"S":"95001200"},"deliveryCode":{"S":"10000080"},"deliveryName":{"S":"Motherhood Hospital Kharghar"},"address":{"S":"Sector 7, Kharghar, Navi Mumbai"},"latitude":{"N":"19.0336"},"longitude":{"N":"73.0645"},"deliveryTimeGroup":{"S":"2"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_CUSTOMER_LOCATIONS --item '{"Id":{"S":"loc-kamothe-lifeline"},"warehouseCode":{"S":"95001200"},"deliveryCode":{"S":"10000090"},"deliveryName":{"S":"Lifeline Multispeciality Hospital"},"address":{"S":"Sector 36, Kamothe, Navi Mumbai"},"latitude":{"N":"19.0178"},"longitude":{"N":"73.0894"},"deliveryTimeGroup":{"S":"2"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_CUSTOMER_LOCATIONS --item '{"Id":{"S":"loc-panvel-lifecare"},"warehouseCode":{"S":"95001200"},"deliveryCode":{"S":"10000100"},"deliveryName":{"S":"Panvel Advanced Trauma Care Centre"},"address":{"S":"Near Orion Mall, Panvel, Navi Mumbai"},"latitude":{"N":"18.9928"},"longitude":{"N":"73.1205"},"deliveryTimeGroup":{"S":"2"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_CUSTOMER_LOCATIONS --item '{"Id":{"S":"loc-airoli-indravati"},"warehouseCode":{"S":"95001200"},"deliveryCode":{"S":"10000110"},"deliveryName":{"S":"Indravati Hospital & Research Centre"},"address":{"S":"Sector 3, Airoli, Navi Mumbai"},"latitude":{"N":"19.1558"},"longitude":{"N":"72.9984"},"deliveryTimeGroup":{"S":"2"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_CUSTOMER_LOCATIONS --item '{"Id":{"S":"loc-ghansoli-surya"},"warehouseCode":{"S":"95001200"},"deliveryCode":{"S":"10000120"},"deliveryName":{"S":"Surya Diagnostic & Healthcare Clinic"},"address":{"S":"Sector 8, Ghansoli, Navi Mumbai"},"latitude":{"N":"19.1245"},"longitude":{"N":"73.0038"},"deliveryTimeGroup":{"S":"2"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_CUSTOMER_LOCATIONS --item '{"Id":{"S":"loc-sanpada-millennium"},"warehouseCode":{"S":"95001200"},"deliveryCode":{"S":"10000130"},"deliveryName":{"S":"Millennium Care Diagnostic Hub"},"address":{"S":"Sector 4, Sanpada, Navi Mumbai"},"latitude":{"N":"19.0628"},"longitude":{"N":"73.0112"},"deliveryTimeGroup":{"S":"1"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_CUSTOMER_LOCATIONS --item '{"Id":{"S":"loc-juinagar-city"},"warehouseCode":{"S":"95001200"},"deliveryCode":{"S":"10000140"},"deliveryName":{"S":"Juinagar Community Healthcare Centre"},"address":{"S":"Sector 23, Juinagar East, Navi Mumbai"},"latitude":{"N":"19.0512"},"longitude":{"N":"73.0234"},"deliveryTimeGroup":{"S":"2"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_CUSTOMER_LOCATIONS --item '{"Id":{"S":"loc-kalamboli-metro"},"warehouseCode":{"S":"95001200"},"deliveryCode":{"S":"10000150"},"deliveryName":{"S":"Metro Hospital & Emergency Centre"},"address":{"S":"Sector 1E, Kalamboli, Navi Mumbai"},"latitude":{"N":"19.0305"},"longitude":{"N":"73.1042"},"deliveryTimeGroup":{"S":"2"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_CUSTOMER_LOCATIONS --item '{"Id":{"S":"loc-rabale-healthcare"},"warehouseCode":{"S":"95001200"},"deliveryCode":{"S":"10000160"},"deliveryName":{"S":"Rabale Industrial Health Clinic"},"address":{"S":"Sector 8, MIDC Rabale, Navi Mumbai"},"latitude":{"N":"19.1362"},"longitude":{"N":"73.0075"},"deliveryTimeGroup":{"S":"1"}}'

echo "  [3] Vehicle data ..."
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_VEHICLES --item '{"Id":{"S":"veh-own-01"},"warehouseCode":{"S":"95001200"},"carNo":{"S":"MH-46-OWN-101"},"carGrade":{"S":"1 Ton"},"maxWeight":{"N":"8000"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_VEHICLES --item '{"Id":{"S":"veh-own-02"},"warehouseCode":{"S":"95001200"},"carNo":{"S":"MH-46-OWN-102"},"carGrade":{"S":"1 Ton"},"maxWeight":{"N":"8000"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_VEHICLES --item '{"Id":{"S":"veh-own-03"},"warehouseCode":{"S":"95001200"},"carNo":{"S":"MH-46-OWN-103"},"carGrade":{"S":"2.5 Ton"},"maxWeight":{"N":"20000"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_VEHICLES --item '{"Id":{"S":"veh-own-04"},"warehouseCode":{"S":"95001200"},"carNo":{"S":"MH-46-OWN-104"},"carGrade":{"S":"2.5 Ton"},"maxWeight":{"N":"20000"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_VEHICLES --item '{"Id":{"S":"veh-own-05"},"warehouseCode":{"S":"95001200"},"carNo":{"S":"MH-46-OWN-105"},"carGrade":{"S":"5 Ton"},"maxWeight":{"N":"40000"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_VEHICLES --item '{"Id":{"S":"veh-con-01"},"warehouseCode":{"S":"95001200"},"carNo":{"S":"MH-46-CON-201"},"carGrade":{"S":"1 Ton"},"maxWeight":{"N":"8000"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_VEHICLES --item '{"Id":{"S":"veh-con-02"},"warehouseCode":{"S":"95001200"},"carNo":{"S":"MH-46-CON-202"},"carGrade":{"S":"2.5 Ton"},"maxWeight":{"N":"20000"}}'
aws dynamodb put-item $PROFILE_OPT --region $REGION --table-name $DDB_VEHICLES --item '{"Id":{"S":"veh-con-03"},"warehouseCode":{"S":"95001200"},"carNo":{"S":"MH-46-CON-203"},"carGrade":{"S":"5 Ton"},"maxWeight":{"N":"40000"}}'

echo ""
echo "Done."
