# PowerShell script to run all microservices with dev profile
Write-Host "Starting microservices with dev profile..." -ForegroundColor Green
Write-Host ""

# Function to start a service
function Start-Service {
    param(
        [string]$ServicePath,
        [string]$ServiceName,
        [int]$Port
    )
    
    Write-Host "Starting $ServiceName on port $Port..." -ForegroundColor Cyan
    Set-Location $ServicePath
    Start-Process -FilePath "powershell" -ArgumentList "-Command", "& '.\gradlew.bat' bootRun --args='--spring.profiles.active=dev'" -WindowStyle Normal
    Set-Location ".."
    Start-Sleep -Seconds 5
}

# Change to project root
Set-Location "c:\Users\edwin\Desktop\integrador\thelarte"

Write-Host "Make sure H2 servers are running first (run start-h2-servers.ps1)" -ForegroundColor Yellow
Write-Host "Press any key to continue or Ctrl+C to cancel..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Start services
Write-Host ""
Write-Host "Starting services..." -ForegroundColor Green

# Start auth-service first (doesn't depend on H2)
Write-Host "Starting auth-service on port 8081..." -ForegroundColor Cyan
Set-Location "microservices\auth-service"
Start-Process -FilePath "powershell" -ArgumentList "-Command", "& '..\..\gradlew.bat' :microservices:auth-service:bootRun --args='--spring.profiles.active=dev'" -WindowStyle Normal
Set-Location "..\..\"
Start-Sleep -Seconds 10

# Start other services
Start-Service -ServicePath "microservices\inventory-service" -ServiceName "inventory-service" -Port 8082
Start-Service -ServicePath "microservices\sales-service" -ServiceName "sales-service" -Port 8083  
Start-Service -ServicePath "microservices\billing-service" -ServiceName "billing-service" -Port 8084

# Start API Gateway last
Write-Host "Starting api-gateway on port 8080..." -ForegroundColor Cyan
Set-Location "api-gateway"
Start-Process -FilePath "powershell" -ArgumentList "-Command", "& '..\gradlew.bat' :api-gateway:bootRun --args='--spring.profiles.active=dev'" -WindowStyle Normal
Set-Location ".."

Write-Host ""
Write-Host "All services starting..." -ForegroundColor Green
Write-Host "Service URLs:" -ForegroundColor Yellow
Write-Host "API Gateway: http://localhost:8080" -ForegroundColor White
Write-Host "Auth Service: http://localhost:8081/auth" -ForegroundColor White
Write-Host "Inventory Service: http://localhost:8082/inventory" -ForegroundColor White
Write-Host "Sales Service: http://localhost:8083/sales" -ForegroundColor White
Write-Host "Billing Service: http://localhost:8084/billing" -ForegroundColor White
Write-Host ""
Write-Host "H2 Console URLs:" -ForegroundColor Yellow
Write-Host "Inventory: http://localhost:8082/inventory/h2-console" -ForegroundColor White
Write-Host "Sales: http://localhost:8083/sales/h2-console" -ForegroundColor White
Write-Host "Billing: http://localhost:8084/billing/h2-console" -ForegroundColor White
