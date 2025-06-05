# PowerShell script to stop all development services
Write-Host "Stopping all development services..." -ForegroundColor Red

# Stop Java processes (Spring Boot applications)
Write-Host "Stopping Spring Boot services..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*java*" -and $_.CommandLine -like "*bootRun*"} | Stop-Process -Force

# Stop H2 Server processes
Write-Host "Stopping H2 database servers..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*java*" -and $_.CommandLine -like "*org.h2.tools.Server*"} | Stop-Process -Force

# Alternative method - stop by port
$ports = @(8080, 8081, 8082, 8083, 8084, 9092, 9093, 9094)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($process) {
        Write-Host "Stopping process on port $port..." -ForegroundColor Cyan
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "All services stopped!" -ForegroundColor Green
