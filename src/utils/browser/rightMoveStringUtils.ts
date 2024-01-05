import { PropertyInfo } from './rightmove';

export async function getFormattedRightMoveInfo(propertyInfo: PropertyInfo) {
  let formattedInfo = `
      **${propertyInfo.title}**
      Price: ${propertyInfo.price || 'Not specified'}
  
      **Description:**
      Type: ${propertyInfo.description.propertyType || 'Not specified'}
      Bedrooms: ${propertyInfo.description.bedrooms || 'Not specified'}
      Bathrooms: ${propertyInfo.description.bathrooms || 'Not specified'}
      Size: ${propertyInfo.description.size || 'Not specified'}
    `;

  if (propertyInfo.commute && propertyInfo.commute.length > 0) {
    for (const commute of propertyInfo.commute) {
      formattedInfo += `
          **Commute From '${commute.location}'**
          Driving Duration: ${commute.drivingDuration || 'Not specified'}
          Public Transport Duration: ${commute.publicTransportDuration || 'Not specified'}
          Walking Duration: ${commute.walkingDuration || 'Not specified'}
          Cycling Duration: ${commute.cyclingDuration || 'Not specified'}
        `;
    }
  }

  return formattedInfo;
}
