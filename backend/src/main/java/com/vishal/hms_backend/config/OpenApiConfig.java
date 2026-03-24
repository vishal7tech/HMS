package com.vishal.hms_backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

        @Bean
        public OpenAPI customOpenAPI() {
                final String securitySchemeName = "bearerAuth";
                return new OpenAPI()
                                .info(new Info()
                                                .title("Hospital Management System API")
                                                .version("1.0.0")
                                                .description("""
                                                        A comprehensive hospital management system with:
                                                        - Appointment booking and management
                                                        - Patient and doctor profiles
                                                        - Real-time WebSocket notifications
                                                        - PDF invoice generation
                                                        - Audit logging
                                                        - Search, filter, and pagination
                                                        - Role-based access control
                                                        """)
                                                .contact(new Contact()
                                                                .name("HMS Development Team")
                                                                .email("support@hms.com")
                                                                .url("https://hms.com"))
                                                .license(new License()
                                                                .name("MIT License")
                                                                .url("https://opensource.org/licenses/MIT")))
                                .servers(List.of(
                                                new Server().url("http://localhost:8080")
                                                                .description("Development Server"),
                                                new Server().url("https://api.hms.com")
                                                                .description("Production Server")))
                                .addSecurityItem(new io.swagger.v3.oas.models.security.SecurityRequirement()
                                                .addList(securitySchemeName))
                                .components(new io.swagger.v3.oas.models.Components()
                                                .addSecuritySchemes(securitySchemeName,
                                                                new io.swagger.v3.oas.models.security.SecurityScheme()
                                                                                .name(securitySchemeName)
                                                                                .type(io.swagger.v3.oas.models.security.SecurityScheme.Type.HTTP)
                                                                                .scheme("bearer")
                                                                                .bearerFormat("JWT")
                                                                                .description("Please provide JWT token for authentication. Use /api/auth/login to get token.")));
        }
}
