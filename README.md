# Hospital Management System (HMS)

A comprehensive full-stack hospital management system built with Spring Boot and React.

## 🏗️ Architecture

### Backend (Spring Boot 3.5.10)
- **Java 17** with modern Spring Boot features
- **JWT Authentication** with stateless security configuration
- **Role-based Access Control** (ADMIN, DOCTOR, RECEPTIONIST, PATIENT)
- **JPA/Hibernate** with MySQL database
- **Flyway** for database migrations
- **Bean Validation** with Jakarta validation
- **Global Exception Handler** with proper error responses
- **OpenAPI/Swagger** documentation
- **Comprehensive Test Suite** with JUnit 5

### Frontend (React 19.2.0)
- **TypeScript** for type safety
- **React Router** for navigation
- **Axios** with JWT interceptors
- **TailwindCSS** for responsive styling
- **Role-based UI Components** with access control
- **Modern UI/UX** with intuitive design

## 🚀 Features

### ✅ Completed Features

#### Backend Services
- **User Authentication & Authorization** with JWT tokens
- **Patient Management** with full CRUD operations
- **Doctor Management** with availability tracking
- **Appointment Booking** with real-time slot validation
- **Appointment Rescheduling & Cancellation**
- **Billing System** with automatic invoice generation
- **Dashboard Statistics** with comprehensive metrics
- **Email Notifications** (mock implementation)
- **Audit Logging** for user activity tracking

#### Frontend UI
- **Responsive Dashboard** with real-time statistics
- **Patient Management Interface** with search and CRUD
- **Doctor Management Interface** with specialization filtering
- **Appointment Booking System** with calendar view
- **Billing Management** with payment status tracking
- **Role-based Navigation** with dynamic menu items
- **Protected Routes** with authentication guards

#### Database & Security
- **Flyway Migrations** with proper versioning
- **Database Constraints** and indexes for performance
- **Input Validation** and sanitization
- **CORS Configuration** for frontend integration
- **Security Headers** and best practices

## 📋 Prerequisites

### Backend Requirements
- Java 17+
- Maven 3.6+
- MySQL 8.0+
- Node.js 16+ (for frontend)

### Frontend Requirements
- Node.js 16+
- npm 8+

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd HMS
```

### 2. Database Setup
```sql
CREATE DATABASE hms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Backend Configuration
```bash
cd backend

# Configure database in src/main/resources/application.properties
# Update MySQL credentials as needed
```

### 4. Run Backend
```bash
# Using Maven
mvn clean install
mvn spring-boot:run

# Or using the Maven Wrapper
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 5. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔧 Configuration

### Backend Configuration (application.properties)
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/hms_db
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT Configuration
jwt.secret=your-secret-key
jwt.expiry=86400000

# Flyway (for production)
spring.flyway.enabled=true
spring.jpa.hibernate.ddl-auto=validate
```

### Frontend Configuration
Update the API base URL in `src/services/api.ts` if needed:
```typescript
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});
```

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=PatientControllerSecurityIT

# Run with coverage
mvn test jacoco:report
```

### Frontend Tests
```bash
cd frontend

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📚 API Documentation

### Swagger UI
Access the interactive API documentation at:
```
http://localhost:8080/swagger-ui.html
```

### API Endpoints
See `API_DOCUMENTATION.md` for comprehensive API documentation with curl examples.

## 👥 Default Users

### Admin User
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `ADMIN`

### Sample Data
The system includes sample doctors and patients created via database migration for testing.

## 🔐 Security Features

### Authentication
- JWT-based stateless authentication
- Secure password hashing with BCrypt (strength 12)
- Token expiration management

### Authorization
- Role-based access control (RBAC)
- Method-level security annotations
- Route protection in frontend

### Data Validation
- Input sanitization and validation
- SQL injection prevention
- XSS protection headers

## 📊 Database Schema

### Core Tables
- **users** - User authentication and roles
- **patients** - Patient information and medical history
- **doctors** - Doctor profiles and availability
- **appointments** - Appointment scheduling and management
- **billings** - Invoice and payment tracking
- **audit_logs** - User activity auditing

### Relationships
- Proper foreign key constraints
- Cascade delete configurations
- Indexing for performance optimization

## 🎯 Role Permissions

| Role | Patients | Doctors | Appointments | Billing | Dashboard |
|-------|-----------|----------|---------------|----------|-----------|
| ADMIN | CRUD | CRUD | CRUD | CRUD | Full |
| RECEPTIONIST | CRUD | CRUD | CRUD | CRUD | Full |
| DOCTOR | Read | Read | CRUD | None | Limited |
| PATIENT | Self | Read | Self | Self | Limited |

## 🚀 Deployment

### Backend (JAR)
```bash
# Build the application
mvn clean package

# Run the JAR
java -jar target/hms-backend-1.0.0.jar
```

### Frontend (Production Build)
```bash
# Build for production
npm run build

# The build will be in the 'dist' folder
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues
- Ensure MySQL is running
- Check database credentials in application.properties
- Verify database exists and user has permissions

#### CORS Issues
- Frontend URL must match CORS configuration
- Check `CorsConfig.java` for allowed origins

#### JWT Token Issues
- Verify JWT secret is properly configured
- Check token expiration settings
- Ensure proper Authorization header format

#### Build Issues
- Clear Maven cache: `mvn clean`
- Update dependencies: `mvn dependency:resolve`
- Check Java version compatibility

## 📈 Performance Considerations

### Database Optimization
- Proper indexing on frequently queried fields
- Connection pooling configuration
- Query optimization for large datasets

### Frontend Optimization
- Code splitting and lazy loading
- Image optimization and caching
- Bundle size optimization

## 🔄 Version Control

### Git Workflow
- Main branch for production releases
- Feature branches for new developments
- Pull requests for code review

## 📝 Development Guidelines

### Backend
- Follow Spring Boot best practices
- Use proper exception handling
- Maintain test coverage above 80%

### Frontend
- Use TypeScript for type safety
- Follow React hooks patterns
- Implement proper error boundaries

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check test cases for usage examples
4. Create an issue with detailed description

## 📄 License

This project is licensed under the MIT License.

---

## 🎉 Quick Start Summary

1. **Setup Database**: Create MySQL database `hms_db`
2. **Configure Backend**: Update `application.properties` with DB credentials
3. **Run Backend**: `mvn spring-boot:run` (starts on port 8080)
4. **Setup Frontend**: `npm install` in frontend directory
5. **Run Frontend**: `npm run dev` (starts on port 5173)
6. **Access Application**: 
   - Frontend: http://localhost:5173
   - API Docs: http://localhost:8080/swagger-ui.html
7. **Login**: Use `admin`/`admin123` for initial access

The Hospital Management System is now ready for use! 🏥
