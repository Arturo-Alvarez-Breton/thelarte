# PowerShell script to start H2 Database Servers for Development
Write-Host "Starting H2 Database Servers for Development..." -ForegroundColor Green
Write-Host ""

# Create data directory if it doesn't exist
if (!(Test-Path "data")) {
    New-Item -ItemType Directory -Path "data"
    Write-Host "Created data directory" -ForegroundColor Yellow
}

# Function to find H2 JAR file
function Find-H2Jar {
    $gradleCache = Join-Path $env:USERPROFILE ".gradle\caches\modules-2\files-2.1\com.h2database\h2"
    if (Test-Path $gradleCache) {
        $h2Jar = Get-ChildItem -Path $gradleCache -Recurse -Filter "h2-*.jar" | Select-Object -First 1
        if ($h2Jar) {
            return $h2Jar.FullName
        }
    }
    
    # Alternative: look in current project
    $projectH2 = Get-ChildItem -Path "." -Recurse -Filter "h2-*.jar" | Select-Object -First 1
    if ($projectH2) {
        return $projectH2.FullName
    }
    
    Write-Host "H2 JAR not found. Please run './gradlew build' first to download dependencies." -ForegroundColor Red
    return $null
}

$h2JarPath = Find-H2Jar
if (-not $h2JarPath) {
    Write-Host "Attempting to download H2 using Gradle..." -ForegroundColor Yellow
    & .\gradlew.bat dependencies
    $h2JarPath = Find-H2Jar
}

if ($h2JarPath) {
    Write-Host "Found H2 JAR: $h2JarPath" -ForegroundColor Green
    
    # Start H2 servers for each microservice
    Write-Host "Starting H2 server for auth-service on port 9091..." -ForegroundColor Cyan
    Start-Process -FilePath "java" -ArgumentList "-cp", "`"$h2JarPath`"", "org.h2.tools.Server", "-tcp", "-tcpPort", "9091", "-tcpAllowOthers", "-baseDir", "./data" -WindowStyle Normal
    
    Start-Sleep -Seconds 2
    
    Write-Host "Starting H2 server for inventory-service on port 9092..." -ForegroundColor Cyan
    Start-Process -FilePath "java" -ArgumentList "-cp", "`"$h2JarPath`"", "org.h2.tools.Server", "-tcp", "-tcpPort", "9092", "-tcpAllowOthers", "-baseDir", "./data" -WindowStyle Normal
    
    Start-Sleep -Seconds 2
    
    Write-Host "Starting H2 server for sales-service on port 9093..." -ForegroundColor Cyan
    Start-Process -FilePath "java" -ArgumentList "-cp", "`"$h2JarPath`"", "org.h2.tools.Server", "-tcp", "-tcpPort", "9093", "-tcpAllowOthers", "-baseDir", "./data" -WindowStyle Normal
    
    Start-Sleep -Seconds 2
    
    Write-Host "Starting H2 server for billing-service on port 9094..." -ForegroundColor Cyan
    Start-Process -FilePath "java" -ArgumentList "-cp", "`"$h2JarPath`"", "org.h2.tools.Server", "-tcp", "-tcpPort", "9094", "-tcpAllowOthers", "-baseDir", "./data" -WindowStyle Normal
    
    Start-Sleep -Seconds 3
    
    Write-Host ""
    Write-Host "H2 servers started successfully!" -ForegroundColor Green
    Write-Host "You can access H2 console at the following URLs:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Auth service: http://localhost:8081/auth/h2-console" -ForegroundColor White
    Write-Host "Inventory service: http://localhost:8082/inventory/h2-console" -ForegroundColor White
    Write-Host "Sales service: http://localhost:8083/sales/h2-console" -ForegroundColor White  
    Write-Host "Billing service: http://localhost:8084/billing/h2-console" -ForegroundColor White
    Write-Host ""
    Write-Host "JDBC Connection URLs:" -ForegroundColor Yellow
    Write-Host "Auth: jdbc:h2:tcp://localhost:9091/./data/auth_dev_db" -ForegroundColor White
    Write-Host "Inventory: jdbc:h2:tcp://localhost:9092/./data/inventory_dev_db" -ForegroundColor White
    Write-Host "Sales: jdbc:h2:tcp://localhost:9093/./data/sales_dev_db" -ForegroundColor White
    Write-Host "Billing: jdbc:h2:tcp://localhost:9094/./data/billing_dev_db" -ForegroundColor White
    Write-Host ""
    Write-Host "Username: sa" -ForegroundColor White
    Write-Host "Password: password" -ForegroundColor White
} else {
    Write-Host "Could not start H2 servers - H2 JAR not found." -ForegroundColor Red
}
