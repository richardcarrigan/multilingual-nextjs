param appName string
param functionAppName string = 'multilingual-nextjs-functions'
param location string = resourceGroup().location
param storageAccountName string = 'multilingualnextjssa'
param translatorGlossaryContainerName string = 'glossaries'
param translatorInputContainerName string = 'input-files'
param translatorName string = 'multilingual-nextjs-translator'
param translatorOutputContainerName string = 'output-files'

// Static web app for hosting Next.js site
resource staticSite 'Microsoft.Web/staticSites@2022-09-01' = {
  name: appName
  location: location
  sku: {
    name: 'Free'
  }
  properties: {}
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  kind: 'web'
  location: location
  name: functionAppName
  properties: {
    Application_Type: 'web'
  }
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
          // Connects function app to application insights
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
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
          name: 'INPUT_BLOB_STORAGE_ACCOUNT_KEY'
          value: listKeys(storageAccount.id, '2019-06-01').keys[0].value
        }
        {
          name: 'INPUT_BLOB_STORAGE_ACCOUNT_NAME'
          value: storageAccount.name
        }
        {
          name: 'INPUT_BLOB_STORAGE_CONTAINER_NAME'
          value: translatorInputContainerName
        }
        {
          name: 'OUTPUT_BLOB_STORAGE_ACCOUNT_KEY'
          value: listKeys(storageAccount.id, '2019-06-01').keys[0].value
        }
        {
          name: 'OUTPUT_BLOB_STORAGE_ACCOUNT_NAME'
          value: storageAccount.name
        }
        {
          name: 'OUTPUT_BLOB_STORAGE_CONTAINER_NAME'
          value: translatorOutputContainerName
        }
        {
          name: 'TRANSLATOR_RESOURCE_KEY'
          value: translator.listKeys().key1
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
  name: translatorName
  location: location
  kind: 'TextTranslation'
  sku: { name: 'F0' }
  properties: {}
}

// Storage account for function app file/log storage, as well as the input, output, and glossary containers for the translation process
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-04-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'Storage'

  resource blobServices 'blobServices@2023-04-01' = {
    name: 'default'

    resource glossariesContainer 'containers@2023-04-01' = {
      name: translatorGlossaryContainerName
    }

    resource inputFilesContainer 'containers@2023-04-01' = {
      name: translatorInputContainerName
    }

    resource outputFilesContainer 'containers@2023-04-01' = {
      name: translatorOutputContainerName
    }
  }
}
