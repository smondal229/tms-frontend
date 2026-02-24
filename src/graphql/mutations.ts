import { gql } from '@apollo/client';

export const CREATE_SHIPMENT = gql`
  mutation CreateShipment($input: ShipmentCreateInput!) {
    createShipment(input: $input) {
      id
      shipperName
      carrierName
      trackingNumber
      rate
      status
      shipmentDeliveryType
      itemValue
      itemWeight
      itemLength
      itemWidth
      itemHeight
      lengthUnit
      weightUnit
      pickedUpAt
      deliveredAt
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SHIPMENT = gql`
  mutation UpdateShipment($id: ID!, $input: ShipmentUpdateInput!) {
    updateShipment(id: $id, input: $input) {
      id
      shipperName
      carrierName
      currentLocation
      trackingNumber
      rate
      itemValue
      status
      shipmentDeliveryType
      pickedUpAt
      deliveredAt
    }
  }
`;
