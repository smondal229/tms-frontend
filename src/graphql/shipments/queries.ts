import { gql } from '@apollo/client';

export const GET_SHIPMENTS = gql`
  query GetShipments(
    $pageSize: Int!
    $after: String
    $filters: ShipmentFilter
    $sort: ShipmentSort
  ) {
    getShipments(pageSize: $pageSize, after: $after, filters: $filters, sort: $sort) {
      shipments {
        id
        trackingNumber
        shipperName
        carrierName
        pickupAddress {
          city
          postalCode
          state
          country
          street
          contactNumber
        }

        deliveryAddress {
          city
          postalCode
          state
          country
          street
          contactNumber
        }
        pickedUpAt
        deliveredAt
        status
        rate
        shipmentDeliveryType
        itemValue
        isFlagged
        currentLocation
        paymentMeta {
          currency
        }
        updatedAt
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_SHIPMENT_BY_ID = gql`
  query GetShipmentByID($id: ID!) {
    getShipmentById(id: $id) {
      id
      trackingNumber
      shipperName
      carrierName
      pickupAddress {
        city
        postalCode
        state
        country
        street
        contactNumber
      }

      deliveryAddress {
        city
        postalCode
        state
        country
        street
        contactNumber
      }
      status
      rate
      shipmentDeliveryType
      itemValue
      itemWeight
      weightUnit
      itemLength
      itemWidth
      itemHeight
      lengthUnit
      currentLocation
      createdAt
      updatedAt
      tracking {
        id
        status
        location
        eventTime
        description
      }
      paymentMeta {
        currency
        provider
        paymentMethod
        transactionId
        status
      }
    }
  }
`;

export const SHIPMENT_FORM_GET_SHIPMENT_BY_ID = gql`
  query GetShipmentByID($id: ID!) {
    getShipmentById(id: $id) {
      id
      trackingNumber
      shipperName
      carrierName
      pickedUpAt
      deliveredAt
      pickupAddress {
        city
        postalCode
        state
        country
        street
        contactNumber
      }

      deliveryAddress {
        city
        postalCode
        state
        country
        street
        contactNumber
      }
      status
      rate
      shipmentDeliveryType
      itemValue
      itemWeight
      weightUnit
      itemLength
      itemWidth
      itemHeight
      lengthUnit
      currentLocation
      createdAt
      updatedAt
      paymentMeta {
        currency
        provider
        paymentMethod
        transactionId
        status
      }
    }
  }
`;

export const GET_ALL_FILTER_OPTIONS = gql`
  query GetAllFilterOptions {
    getAllFilterOptions {
      carriers {
        value
        label
      }
      statuses {
        value
        label
      }
      shipmentDeliveryTypes {
        value
        label
      }
    }
  }
`;

export const CALCULATE_RATE = gql`
  query CalculateRate($pricingRequest: PricingRequest!) {
    calculateRate(pricingRequest: $pricingRequest)
  }
`;
