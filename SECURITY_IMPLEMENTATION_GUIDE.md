# Role-Based Security Implementation - Testing Guide

## Overview
This implementation provides comprehensive role-based security for your Spring Boot application using JWT authentication. The system enforces both backend and frontend security controls.

## Security Features Implemented

### 1. Backend Security (Spring Security)
- JWT token validation for all protected routes
- Role-based access control for pages and API endpoints
- Automatic redirection to login for unauthorized access
- Cookie and header-based token support

### 2. Frontend Security (JavaScript)
- Client-side role validation and redirection
- Automatic token refresh and validation
- Role-based content visibility
- Enhanced login handling with proper error management

## Role-Based Access Matrix

| Role | Pages Access | API Endpoints Access |
|------|-------------|---------------------|
| ADMINISTRADOR | `/pages/admin/**` | All endpoints |
| TI | `/pages/ti/**` | usuarios, empleados, suplidores, productos |
| VENDEDOR | `/pages/vendedor/**` | suplidores, productos |
| CAJERO | `/pages/cajero/**` | productos, transacciones |
| CONTABILIDAD | `/pages/contabilidad/**` | transacciones, reportes |

## Testing Instructions

### Step 1: Verify Dependencies
Make sure your `build.gradle` includes:
```gradle
implementation 'org.springframework.boot:spring-boot-starter-security'
implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
implementation 'io.jsonwebtoken:jjwt-impl:0.11.5'
implementation 'io.jsonwebtoken:jjwt-jackson:0.11.5'
```

### Step 2: Test User Creation
Create test users with different roles using your existing user creation system:

```sql
-- Sample users for testing (passwords should be hashed)
INSERT INTO users (username, password, active) VALUES 
('admin', '$2a$10$encoded_password', true),
('ti_user', '$2a$10$encoded_password', true),
('vendedor_user', '$2a$10$encoded_password', true),
('cajero_user', '$2a$10$encoded_password', true),
('contabilidad_user', '$2a$10$encoded_password', true);

-- Sample roles
INSERT INTO user_roles (user_id, role) VALUES 
(1, 'ADMINISTRADOR'),
(2, 'TI'),
(3, 'VENDEDOR'),
(4, 'CAJERO'),
(5, 'CONTABILIDAD');
```

### Step 3: Test Authentication Flow
1. Start the application
2. Navigate to `http://localhost:8080`
3. Should redirect to `/pages/login.html`
4. Try accessing protected pages directly - should redirect to login

### Step 4: Test Role-Based Access
1. Login with different user roles
2. Verify redirection to appropriate dashboard
3. Try accessing unauthorized pages - should redirect to login

### Step 5: Test API Security
Use tools like Postman or curl to test API endpoints:

```bash
# Login to get token
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Use token to access protected endpoint
curl -X GET http://localhost:8080/api/usuarios \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Expected Behavior

### Successful Login Flow
1. User enters valid credentials
2. Server returns JWT token
3. Token stored in localStorage and cookie
4. User redirected to role-appropriate dashboard

### Access Control Flow
1. User tries to access protected page
2. System validates JWT token
3. System checks user roles against page requirements
4. Access granted or redirect to login

### Logout Flow
1. User clicks logout
2. Token cleared from localStorage and cookie
3. User redirected to login page

## Files Created/Modified

### Backend Files
- `SecurityConfig.java` - Role-based security configuration
- `PageAccessController.java` - Authentication API endpoints
- `AuthController.java` - Enhanced with cookie support
- `JwtFilter.java` - Enhanced token resolution
- `HomeController.java` - Role-based dashboard redirection

### Frontend Files
- `auth-manager.js` - Core authentication and role management
- `login-handler.js` - Enhanced login functionality
- `sample-protected-page.html` - Example of protected page
- Updated `login.html` - Integration with new security system

## Troubleshooting

### Common Issues
1. **403 Access Denied**: Check user roles match page requirements
2. **401 Unauthorized**: Verify JWT token is valid and not expired
3. **Redirect Loop**: Ensure login page is properly excluded from security
4. **Token Not Found**: Check if token is stored in localStorage/cookie

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify JWT token in browser dev tools
3. Check server logs for authentication failures
4. Validate user roles in database

## Security Best Practices Implemented
- HTTP-only cookies for JWT storage
- Secure token transmission
- Proper CORS configuration
- Session management with stateless JWT
- Role-based authorization at multiple layers
- Client-side and server-side validation

This implementation provides enterprise-level security suitable for production use with proper role segregation and access control.
