package com.thelarte.thelarte;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@SpringBootApplication
public class ThelarteApplication {

	private static final Logger logger = LoggerFactory.getLogger(ThelarteApplication.class);

	public static void main(String[] args) {
		System.setProperty("spring.profiles.active", "dev");
		logger.info("🎨 Iniciando Thelarte Platform Orchestrator con perfil DEV");
		SpringApplication.run(ThelarteApplication.class, args);
	}

	@Component
	public static class ServiceLauncher {

		private static final Logger logger = LoggerFactory.getLogger(ServiceLauncher.class);

		@EventListener(ApplicationReadyEvent.class)
		public void startAllServices() {
			logger.info("🚀 Iniciando todos los servicios de Thelarte...");
			
			// Crear directorio de datos
			createDataDirectory();
			
			// Iniciar servidores H2 primero
			startH2Servers();
			
			// Esperar un poco para que los servidores H2 se inicien
			try {
				TimeUnit.SECONDS.sleep(8);
			} catch (InterruptedException e) {
				Thread.currentThread().interrupt();
			}
			
			// Iniciar microservicios
			startMicroservices();
			
			// Mostrar URLs de acceso
			showAccessUrls();
		}

		private void createDataDirectory() {
			try {
				Path dataDir = Paths.get("data");
				if (!Files.exists(dataDir)) {
					Files.createDirectories(dataDir);
					logger.info("📁 Directorio 'data' creado para bases de datos H2");
				}
			} catch (IOException e) {
				logger.error("❌ Error creando directorio de datos: {}", e.getMessage());
			}
		}
		private void startH2Servers() {
			logger.info("📊 Iniciando servidores H2 en modo servidor...");
			
			CompletableFuture.runAsync(() -> startH2Server(9091, "auth"));
			CompletableFuture.runAsync(() -> startH2Server(9092, "inventory"));
			CompletableFuture.runAsync(() -> startH2Server(9093, "sales"));
			CompletableFuture.runAsync(() -> startH2Server(9094, "billing"));
			
			logger.info("✅ Servidores H2 iniciándose en puertos 9091, 9092, 9093, 9094");
		}

		private void startH2Server(int port, String serviceName) {
			try {
				String h2Jar = findH2Jar();
				if (h2Jar == null) {
					logger.error("❌ No se encontró el JAR de H2. Ejecuta 'gradlew build' primero.");
					return;
				}
				
				String[] command = {
					"java", "-cp", h2Jar,
					"org.h2.tools.Server",
					"-tcp", "-tcpPort", String.valueOf(port),
					"-tcpAllowOthers", "-baseDir", "./data"
				};
				
				ProcessBuilder pb = new ProcessBuilder(command);
				pb.directory(new File("."));
				pb.start(); // Removed unused process variable
				
				logger.info("🗄️  H2 Server para {} iniciado en puerto {}", serviceName, port);
				
			} catch (IOException e) {
				logger.error("❌ Error iniciando H2 server para {}: {}", serviceName, e.getMessage());
			}
		}

		private void startMicroservices() {
			logger.info("🔧 Iniciando microservicios con perfil DEV...");
			
			// Iniciar servicios en orden con delays apropiados
			CompletableFuture.runAsync(() -> startService("auth-service", 8081, 0));
			CompletableFuture.runAsync(() -> startService("inventory-service", 8082, 12));
			CompletableFuture.runAsync(() -> startService("sales-service", 8083, 18));
			CompletableFuture.runAsync(() -> startService("billing-service", 8084, 24));
			CompletableFuture.runAsync(() -> startService("api-gateway", 8080, 30));
		}

		private void startService(String serviceName, int port, int delaySeconds) {
			try {
				if (delaySeconds > 0) {
					TimeUnit.SECONDS.sleep(delaySeconds);
				}
				
				String gradleTask = serviceName.equals("api-gateway") ? 
					":api-gateway:bootRun" : 
					":microservices:" + serviceName + ":bootRun";
				
				// Usar PowerShell para mejor compatibilidad en Windows
				String[] command = {
					"powershell", "-Command",
					"& '.\\gradlew.bat' " + gradleTask + " --args='--spring.profiles.active=dev'"
				};
				
				ProcessBuilder pb = new ProcessBuilder(command);
				pb.directory(new File("."));
				pb.inheritIO();
				pb.start(); // Removed unused process variable
				
				logger.info("🎯 {} iniciándose en puerto {} con perfil DEV", serviceName, port);
				
			} catch (IOException | InterruptedException e) {
				logger.error("❌ Error iniciando {}: {}", serviceName, e.getMessage());
				if (e instanceof InterruptedException) {
					Thread.currentThread().interrupt();
				}
			}
		}
		private String findH2Jar() {
			// Buscar el JAR de H2 en el cache de Gradle
			String userHome = System.getProperty("user.home");
			String h2Path = userHome + "\\.gradle\\caches\\modules-2\\files-2.1\\com.h2database\\h2";
			
			File h2Dir = new File(h2Path);
			if (!h2Dir.exists()) {
				logger.warn("🔍 H2 JAR no encontrado en cache de Gradle. Directorio no existe: {}", h2Path);
				return null;
			}
			
			return findH2JarInDirectory(h2Dir);
		}
		
		private String findH2JarInDirectory(File h2Dir) {
			File[] versions = h2Dir.listFiles();
			if (versions == null || versions.length == 0) {
				return null;
			}
			
			for (File versionDir : versions) {
				if (versionDir.isDirectory()) {
					String jarPath = findJarInVersionDirectory(versionDir);
					if (jarPath != null) {
						return jarPath;
					}
				}
			}
			
			logger.warn("🔍 H2 JAR no encontrado en cache de Gradle. Buscando alternativas...");
			return null;
		}
		
		private String findJarInVersionDirectory(File versionDir) {
			File[] hashDirs = versionDir.listFiles();
			if (hashDirs == null) {
				return null;
			}
			
			for (File hashDir : hashDirs) {
				if (hashDir.isDirectory()) {
					File[] jars = hashDir.listFiles((dir, name) -> name.endsWith(".jar"));
					if (jars != null && jars.length > 0) {
						return jars[0].getAbsolutePath();
					}
				}
			}
			return null;
		}
		private void showAccessUrls() {
			CompletableFuture.runAsync(() -> {
				try {
					TimeUnit.SECONDS.sleep(35);
					
					// Using logger.info to display startup completion message
					String separator = "=".repeat(80);
					logger.info("\n{}", separator);
					logger.info("🎉 THELARTE PLATFORM INICIADO CORRECTAMENTE");
					logger.info("{}", separator);
					logger.info("📱 URLs de Servicios:");
					logger.info("   • API Gateway: http://localhost:8080");
					logger.info("   • Auth Service: http://localhost:8081/auth");
					logger.info("   • Inventory Service: http://localhost:8082/inventory");
					logger.info("   • Sales Service: http://localhost:8083/sales");
					logger.info("   • Billing Service: http://localhost:8084/billing");
					logger.info("\n🗄️  URLs de H2 Console (para debugging):");
					logger.info("   • Inventory DB: http://localhost:8082/inventory/h2-console");
					logger.info("   • Sales DB: http://localhost:8083/sales/h2-console");
					logger.info("   • Billing DB: http://localhost:8084/billing/h2-console");
					logger.info("\n🔗 Conexiones JDBC para herramientas externas:");
					logger.info("   • Inventory: jdbc:h2:tcp://localhost:9092/./data/inventory_dev_db");
					logger.info("   • Sales: jdbc:h2:tcp://localhost:9093/./data/sales_dev_db");
					logger.info("   • Billing: jdbc:h2:tcp://localhost:9094/./data/billing_dev_db");
					logger.info("   • Usuario: sa | Contraseña: password");
					logger.info("{}", separator);
					
				} catch (InterruptedException e) {
					Thread.currentThread().interrupt();
				}
			});
		}
	}
}
