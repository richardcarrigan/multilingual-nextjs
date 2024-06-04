param location string = resourceGroup().location
param functionAppName string = 'multilingual-nextjs-functions'

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
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  properties: {
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
    reserved: true
    siteConfig: {
      appSettings: [
        {
          // Specifies storage account to send runtime logs to
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${listKeys(storageAccount.id, '2019-06-01').keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
        }
        {
          // Specifies Azure Functions runtime, not stack (i.e. Node.js) runtime
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          // Specifies stack (i.e. Node.js || .NET)
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          // Specifies storage account to run functions from, store function code files in
          name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${listKeys(storageAccount.id, '2019-06-01').keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
        }
        {
          // Not sure what this does, but it's required for consumption plan function apps
          name: 'WEBSITE_CONTENTSHARE'
          value: toLower(functionAppName)
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
