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

// Function app for orchestrating translation process
resource functionApp 'Microsoft.Web/sites@2023-12-01' = {
  name: 'multilingual-nextjs-functions'
  location: location
  kind: 'functionapp,linux'
  properties: {
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
    reserved: true
    siteConfig: {
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${listKeys(storageAccount.id, '2019-06-01').keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
        }
      ]
      cors: {
        allowedOrigins: [
          'https://portal.azure.com'
        ]
      }
      linuxFxVersion: 'Node|20'
    }
  }
}

// Translation service
resource translator 'Microsoft.CognitiveServices/accounts@2023-10-01-preview' = {
  name: 'multilingual-nextjs-translator'
  location: location
  kind: 'TextTranslation'
  sku: { name: 'F0' }
  properties: {}
}

// Storage account for function app file/log storage, as well as the input, output, and glossary containers for the translation process
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-04-01' = {
  name: 'multilingualnextjssa'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'Storage'

  resource blobServices 'blobServices@2023-04-01' = {
    name: 'default'

    resource inputFilesContainer 'containers@2023-04-01' = {
      name: 'input-files'
    }

    resource outputFilesContainer 'containers@2023-04-01' = {
      name: 'output-files'
    }
  }
}
