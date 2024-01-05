import { PropertyInfo } from './rightmove';

export async function getFormattedRightMoveInfo(propertyInfo: PropertyInfo) {
  return `
    **${propertyInfo.title}**
    Price: ${propertyInfo.price || 'Not specified'}

    **Description:**
    Type: ${propertyInfo.description.propertyType || 'Not specified'}
    Bedrooms: ${propertyInfo.description.bedrooms || 'Not specified'}
    Bathrooms: ${propertyInfo.description.bathrooms || 'Not specified'}
    Size: ${propertyInfo.description.size || 'Not specified'}

    **Commute From '${propertyInfo.commute?.location}'**
    Driving Duration: ${propertyInfo.commute?.drivingDuration || 'Not specified'}
    Public Transport Duration: ${propertyInfo.commute?.publicTransportDuration || 'Not specified'}
    Walking Duration: ${propertyInfo.commute?.walkingDuration || 'Not specified'}
    Cycling Duration: ${propertyInfo.commute?.cyclingDuration || 'Not specified'}
    `;
}
