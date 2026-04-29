📘 Formation Service – Microservice Documentation
📌 Overview

The Formation Service is a Spring Boot microservice built within a Spring Cloud microservices architecture.
It provides full management of training programs, tests, rewards, certifications, and advanced features such as statistics, calendar scheduling, and Facebook sharing.

🧱 System Architecture

The system is based on a microservices architecture composed of:

🔍 Eureka Server – Service discovery
🌐 API Gateway – Single entry point for all requests
🔗 OpenFeign – Inter-service communication
🧩 Microservices ecosystem:
formation-service
micro-user
other supporting services
⚙️ Technologies Used
Java 21
Spring Boot 3.x
Spring Cloud (Eureka, OpenFeign, Gateway)
Spring Data JPA
MySQL
OpenCSV
JUnit 5
Mockito
Maven
📦 Core Entities

The microservice is composed of 4 main entities:

🎓 1. Formation
Training program management
Title, description, duration, level, price
Linked to categories and users
📚 2. Course
Educational content linked to a formation
Modules and learning materials
🧪 3. Test
Tests generated from CSV datasets
Automatic correction system
Score calculation and validation
🏆 4. Reward
Reward and badge system
Points assigned based on user performance
🚀 Key Features
🎓 Training Management
Full CRUD operations for formations
Association with users and courses
🧪 Test Generation & Auto Correction
Automatic test generation from CSV datasets
Automatic grading system
Score calculation and validation
🏆 Certification System
Automatic certificate generation
Based on test success results
📊 Statistics
User performance tracking
Test results analytics
📅 Calendar Integration
Training schedule management
Session planning
📤 Social Sharing
Share formations on Facebook
🔗 Inter-Service Communication
🔹 OpenFeign → communication between formation-service and micro-user
🔹 Eureka → service discovery and registration
🔹 API Gateway → centralized request routing
🧪 Testing Strategy
✔ Unit Testing
JUnit 5
Mockito
Service layer testing
✔ Integration Testing
REST API testing
End-to-end endpoint validation
Microservices communication testing (Feign + Eureka)
▶️ How to Run the Project
1. Start Eureka Server
   http://localhost:8761
2. Start Microservices
   formation-service 
3. api-gateway
   
⚙️ Configuration
   spring.application.name=formation-service
   server.port=8084

spring.datasource.url=jdbc:mysql://localhost:3306/projet_pi
spring.datasource.username=root
spring.datasource.password=

eureka.client.service-url.defaultZone=http://localhost:8761/eureka
🔗 OpenFeign Example
@FeignClient(name = "micro-user")
public interface UserClient {

    @GetMapping("/auth/user/{id}")
    UserDTO getUserById(@PathVariable Long id);
}
🏁 Conclusion

The Formation Service provides a complete training management system with:

Modern microservices architecture
Inter-service communication via OpenFeign
Service discovery via Eureka
API routing via Gateway
Automated test generation and certification system
👨‍💻 Author
Mohamed Aziz Aroua - Esprit tn 