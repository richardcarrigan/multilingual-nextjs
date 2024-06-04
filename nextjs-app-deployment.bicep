param location string = resourceGroup().location
param appName string

// Static web app for hosting Next.js site
resource staticSite 'Microsoft.Web/staticSites@2022-09-01' = {
  name: appName
  location: location
  sku: {
    name: 'Free'
  }
  properties: {}
}
