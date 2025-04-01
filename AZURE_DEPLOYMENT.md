
# Azure Deployment Guide

This document provides instructions for deploying the application to Azure.

## Prerequisites

1. Azure account
2. Azure CLI installed
3. PostgreSQL database on Azure
4. Azure App Service for hosting

## Deployment Steps

### 1. Set up Azure PostgreSQL

1. Create an Azure Database for PostgreSQL
2. Configure firewall rules to allow your application to connect
3. Note down the connection string

### 2. Configure Environment Variables

Create the following environment variables in your Azure App Service:

- AZURE_DEPLOYMENT=true
- DATABASE_URL=postgresql://username@servername:password@servername.postgres.database.azure.com:5432/dbname
- JWT_SECRET_KEY=your-secure-jwt-secret
- JWT_ALGORITHM=HS256
- ACCESS_TOKEN_EXPIRE_MINUTES=30
- OPENAI_API_KEY=your-openai-api-key
- ROOT_PATH=/

### 3. Deploy Backend to Azure App Service

```bash
# Login to Azure
az login

# Create resource group if it doesn't exist
az group create --name YourResourceGroup --location eastus

# Create App Service plan
az appservice plan create --name YourAppServicePlan --resource-group YourResourceGroup --sku B1 --is-linux

# Create Web App
az webapp create --resource-group YourResourceGroup --plan YourAppServicePlan --name YourWebAppName --runtime "PYTHON|3.9"

# Configure startup command
az webapp config set --resource-group YourResourceGroup --name YourWebAppName --startup-file "/home/site/wwwroot/startup.sh"

# Deploy code
az webapp deploy --resource-group YourResourceGroup --name YourWebAppName --src-path ./backend --type zip

# Set environment variables
az webapp config appsettings set --resource-group YourResourceGroup --name YourWebAppName --settings AZURE_DEPLOYMENT=true DATABASE_URL="your-connection-string" JWT_SECRET_KEY="your-secret-key" OPENAI_API_KEY="your-api-key"
```

### 4. Deploy Frontend

1. Build the frontend:
```bash
npm run build
```

2. Create another App Service for the frontend or use Azure Static Web Apps
```bash
az webapp create --resource-group YourResourceGroup --plan YourAppServicePlan --name YourFrontendAppName --runtime "NODE|16-lts"
```

3. Deploy the built frontend
```bash
az webapp deploy --resource-group YourResourceGroup --name YourFrontendAppName --src-path ./dist --type zip
```

4. Configure the frontend environment variables
```bash
az webapp config appsettings set --resource-group YourResourceGroup --name YourFrontendAppName --settings VITE_API_BASE_URL="https://your-backend-app.azurewebsites.net/api"
```

## Troubleshooting

- If you experience CORS issues, ensure your backend CORS settings include your frontend URL
- Check the Application Logs in Azure Portal for debugging information
- Ensure PostgreSQL firewall rules allow connections from Azure App Service
