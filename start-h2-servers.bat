@echo off
echo Starting H2 Database Servers for Development...
echo.

REM Create data directory if it doesn't exist
if not exist "data" mkdir data

REM Start H2 servers for each microservice
echo Starting H2 server for inventory-service on port 9092...
start "H2-Inventory" java -cp "%USERPROFILE%\.gradle\caches\modules-2\files-2.1\com.h2database\h2\*\*.jar" org.h2.tools.Server -tcp -tcpPort 9092 -tcpAllowOthers -baseDir ./data

echo Starting H2 server for sales-service on port 9093...
start "H2-Sales" java -cp "%USERPROFILE%\.gradle\caches\modules-2\files-2.1\com.h2database\h2\*\*.jar" org.h2.tools.Server -tcp -tcpPort 9093 -tcpAllowOthers -baseDir ./data

echo Starting H2 server for billing-service on port 9094...
start "H2-Billing" java -cp "%USERPROFILE%\.gradle\caches\modules-2\files-2.1\com.h2database\h2\*\*.jar" org.h2.tools.Server -tcp -tcpPort 9094 -tcpAllowOthers -baseDir ./data

echo.
echo H2 servers started successfully!
echo You can access H2 console at: http://localhost:8080/[service]/h2-console
echo.
echo Inventory service: http://localhost:8082/inventory/h2-console
echo Sales service: http://localhost:8083/sales/h2-console  
echo Billing service: http://localhost:8084/billing/h2-console
echo.
echo JDBC URLs:
echo Inventory: jdbc:h2:tcp://localhost:9092/./data/inventory_dev_db
echo Sales: jdbc:h2:tcp://localhost:9093/./data/sales_dev_db
echo Billing: jdbc:h2:tcp://localhost:9094/./data/billing_dev_db
echo.
pause
