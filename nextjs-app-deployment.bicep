param location string = resourceGroup().location

// Static web app for hosting Next.js site
resource staticSite 'Microsoft.Web/staticSites@2022-09-01' = {
  name: 'multilingual-nextjs-app'
  location: location
  sku: {
    name: 'Free'
  }
  properties: {}
}
