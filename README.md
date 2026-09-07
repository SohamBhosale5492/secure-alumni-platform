
# Secure Alumni Platform

A secure, containerized alumni management and engagement platform with an integrated web application security monitoring system.

The project combines two major components:

1. Alumni Management Platform
2. Web Application Security Monitoring and Intrusion Detection System

The application is designed to help students, alumni, and administrators manage profiles, events, mentorship, opportunities, and announcements while providing security monitoring for suspicious activity.

---


## Features

### Alumni Platform

- User registration and login
- JWT-based authentication
- Role-based access control
- Student, Alumni, and Admin roles
- Profile management
- Profile image upload
- Resume/document upload
- Alumni directory
- Event creation and registration
- Mentorship system
- Mentor requests and approvals
- Job and internship opportunities
- Opportunity applications
- Announcements
- Admin user management
- Admin dashboard

### Security System

The application includes a reusable security monitoring system for Express.js applications.

Security features include:

- Request logging
- IP address tracking
- Optional IP geolocation
- Brute-force login detection
- Progressive login protection
- CAPTCHA protection
- Temporary account locking
- API abuse detection
- Temporary IP blocking
- Injection and XSS payload detection
- Suspicious upload detection
- Threat scoring
- Threat-level calculation
- Security alerts
- Blocked IP management
- Security Operations Center (SOC)-style dashboard

### Progressive Login Protection

The security system increases protection when repeated login failures occur:

- 4 failed login attempts → Cooldown
- 8 failed login attempts → CAPTCHA required
- 12 failed login attempts → Temporary account lock

---


# Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication

### Security

- Custom Express security middleware
- Threat detection
- Request monitoring
- Brute-force protection
- Security alerts

### Containerization

- Docker
- Docker Compose
- Nginx
- Docker Hub

---


# Project Architecture

The application uses separate containers for the frontend and backend.

```text
                    User
                      |
                      v
              +---------------+
              |    Browser    |
              +---------------+
                      |
                      | :8080
                      v
              +---------------+
              |    Nginx      |
              |   Frontend    |
              +---------------+
                      |
                   /api/*
                      |
                      v
              +---------------+
              |    Node.js    |
              |    Express    |
              |    Backend    |
              +---------------+
                      |
                      v
              +---------------+
              |    MongoDB    |
              |     Atlas     |
              +---------------+

              Security System
                      |
                      v
              Logs / Threats /
              Alerts / IPs
________________________________________
Docker Architecture
The project uses two Docker images:
soham5492/secure-alumni-backend:latest
soham5492/secure-alumni-frontend:latest
Docker Compose manages both containers.
Docker Compose
      |
      +---- Backend Container
      |       Port: 5000
      |
      +---- Frontend Container
              Port: 8080
              Nginx: Port 80
The frontend container uses Nginx to serve the React application and proxy /api/ requests to the backend container.
________________________________________
Requirements
Before running the project, install:
•	Docker Desktop
•	Git
You also need a MongoDB database.
MongoDB Atlas can be used as the database provider.
________________________________________
Getting the Project
Clone the repository:
git clone THIS_GITHUB_REPOSITORY_URL
Enter the project directory:
cd secure-alumni-platform
________________________________________
Environment Configuration
The project requires environment variables for the MongoDB connection and JWT authentication.
Create a .env file in the project root:
.env
Add:
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
Example:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/secure-alumni-platform
JWT_SECRET=replace-with-your-own-random-secret
Do NOT use the example values as real credentials.
Never commit the real .env file to GitHub.
________________________________________
MongoDB Atlas Setup
If using MongoDB Atlas:
1.	Create a MongoDB Atlas account.
2.	Create a cluster.
3.	Create a database user.
4.	Set the user’s username and password.
5.	Configure Network Access.
6.	Allow the IP address from which the application will connect.
7.	Copy the connection string.
8.	Put the connection string in MONGODB_URI.
The connection string normally follows this format:
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME
If your username or password contains special characters, they must be URL-encoded before being placed in the MongoDB URI.
________________________________________
JWT Secret
JWT_SECRET is a secret value used by the backend to sign and verify JSON Web Tokens.
Example:
JWT_SECRET=my-long-random-secret
For production, use a strong randomly generated secret.
Do not publish the JWT secret.
________________________________________
Docker Compose Setup
The easiest way to run the complete application is Docker Compose.
Make sure you are inside the directory containing:
docker-compose.yml
Then run:
docker compose up -d
Docker Compose will:
1.	Create the Docker network.
2.	Pull the backend image if it is not available locally.
3.	Pull the frontend image if it is not available locally.
4.	Create the backend container.
5.	Create the frontend container.
6.	Start both containers.
________________________________________
Check Running Containers
Run:
docker compose ps
You should see something similar to:
NAME                     SERVICE     STATUS
secure-alumni-backend    backend     Up
secure-alumni-frontend   frontend    Up
________________________________________
Open the Application
Once the containers are running, open:
http://localhost:8080
The login page can be accessed at:
http://localhost:8080/login
________________________________________
Backend Health Check
The backend runs internally on port 5000.
For a direct local backend setup, the health endpoint is:
http://localhost:5000/health
When running through the Compose setup, the frontend communicates with the backend through the internal Docker network.
________________________________________
First User Registration
Open:
http://localhost:8080/register
Create an account.
The first registered account automatically receives the Admin role.
After registration, log in using the account credentials.
________________________________________
User Roles
The platform supports three main roles:
Student
Students can use features such as:
•	Profile management
•	Alumni directory
•	Events
•	Mentorship
•	Opportunities
•	Applications
Alumni
Alumni can:
•	Manage their profile
•	Participate in events
•	Provide mentorship
•	Post opportunities
•	Interact with the alumni platform
Admin
Administrators have additional access to:
•	Admin dashboard
•	User management
•	Announcements
•	Security dashboard
•	Security alerts
•	Blocked IP management
•	Platform overview
________________________________________
Basic User Workflow
1. Register
Open:
http://localhost:8080/register
Create a new account.
If this is the first account, it becomes an administrator.
________________________________________
2. Login
Open:
http://localhost:8080/login
Enter:
•	Email
•	Password
If repeated failed login attempts occur, the security system can require a CAPTCHA token.
________________________________________
3. Dashboard
After login, the dashboard provides an overview of the platform.
Depending on the user’s role, different features will be available.
________________________________________
4. Profile
Users can manage their profile information.
The platform also supports:
•	Profile image upload
•	Resume/document upload
________________________________________
5. Alumni Directory
Users can browse the alumni directory and view available alumni information.
________________________________________
6. Events
Users can view available events and register for them.
Administrators can create events.
________________________________________
7. Mentorship
Users can view available mentors and submit mentorship requests.
Mentors can manage incoming requests.
________________________________________
8. Opportunities
Alumni can publish:
•	Jobs
•	Internships
•	Other opportunities
Users can view opportunities and submit applications.
________________________________________
9. Announcements
Administrators can publish announcements for users.
Announcements can be targeted to users or specific roles.
________________________________________
Security Dashboard
Administrators can access the security dashboard.
The dashboard provides visibility into:
•	API requests
•	Failed login attempts
•	Threat scores
•	Threat levels
•	Security alerts
•	Blocked IP addresses
•	Suspicious activity
The security system records contextual information such as requests, IP addresses, routes, status codes, and threat scores.
________________________________________
Testing Security Protection
The application contains progressive protection against repeated failed login attempts.
You can test the protection by intentionally entering incorrect login credentials multiple times.
The security system progressively applies:
Failed attempts
      |
      v
Cooldown
      |
      v
CAPTCHA
      |
      v
Temporary account lock
This functionality can be observed from the security dashboard.
________________________________________
Docker Commands
Start the application
docker compose up -d
Stop the application
docker compose down
View running containers
docker compose ps
View all containers including stopped containers
docker compose ps -a
View backend logs
docker compose logs backend
View frontend logs
docker compose logs frontend
Follow backend logs
docker compose logs -f backend
Restart the application
docker compose restart
Recreate containers
docker compose up -d --force-recreate
________________________________________
Docker Images
The project uses the following Docker Hub images:
Backend:
soham5492/secure-alumni-backend:latest
Frontend:
soham5492/secure-alumni-frontend:latest
Docker Compose automatically pulls the required images when they are not available locally.
________________________________________
Pull Images Manually
If required, the images can also be pulled manually:
docker pull soham5492/secure-alumni-backend:latest
docker pull soham5492/secure-alumni-frontend:latest
Then start the application:
docker compose up -d
________________________________________
Stop and Remove Containers
To stop and remove the Compose containers and network:
docker compose down
This does not remove the Docker images.
The images remain available locally and can be used again with:
docker compose up -d
________________________________________
Useful Docker Commands
List images:
docker images
List running containers:
docker ps
List all containers:
docker ps -a
Remove an image:
docker rmi IMAGE_NAME
________________________________________
Local Development Without Docker
Docker Compose is recommended for the containerized deployment.
For normal local development, install the project dependencies:
npm install
Run project checks:
npm run check
Run the backend:
npm run dev:backend
Run the frontend:
npm run dev:frontend
The development frontend normally runs at:
http://localhost:5173
The backend normally runs at:
http://localhost:5000
________________________________________
Project Structure
secure-alumni-platform/
│
├── alumni-platform/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── server.js
│   │   │
│   │   └── package.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── context/
│       │   ├── pages/
│       │   ├── services/
│       │   └── styles.css
│       │
│       └── package.json
│
├── security-system/
│   ├── alert-system/
│   ├── detection-engine/
│   ├── middleware/
│   ├── models/
│   ├── monitoring-dashboard/
│   └── index.js
│
├── database/
│   └── schema.md
│
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
├── nginx.conf
├── .env.example
├── .gitignore
├── package.json
└── README.md
________________________________________
Environment Variables
The main environment variables are:
Variable	Description
MONGODB_URI	MongoDB database connection string
JWT_SECRET	Secret used for JWT authentication
JWT_EXPIRES_IN	JWT expiration time
NODE_ENV	Application environment
PORT	Backend port
CORS_ORIGIN	Allowed frontend origin
DEMO_CAPTCHA_TOKEN	Demo CAPTCHA token
Example:
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
________________________________________
Security and Secrets
Never commit sensitive information to GitHub.
Do NOT publish:
.env
MongoDB username
MongoDB password
MongoDB connection string
JWT secret
API keys
private credentials
Use .env.example to document required variables without exposing real values.
Example:
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
________________________________________
Troubleshooting
Docker Compose says configuration file was not found
Make sure you are inside the project directory containing:
docker-compose.yml
Check the current directory:
pwd
On PowerShell:
Get-Location
Then run:
docker compose up -d
________________________________________
Backend container is not running
Check:
docker compose ps -a
Then check the backend logs:
docker compose logs backend
________________________________________
MongoDB authentication failed
Check:
MONGODB_URI=...
Make sure:
•	MongoDB username is correct.
•	MongoDB password is correct.
•	Database user exists.
•	The connecting IP is allowed in MongoDB Atlas.
•	Special characters in the password are URL-encoded.
________________________________________
MONGODB_URI is required
Make sure the .env file exists in the project root and contains:
MONGODB_URI=your_mongodb_connection_string
Then restart:
docker compose down
docker compose up -d
________________________________________
Backend exits with an error
Check:
docker compose logs backend
The logs usually show the reason why the backend stopped.
________________________________________
Frontend loads but API requests fail
Check that both containers are running:
docker compose ps
Then check backend logs:
docker compose logs backend
Also verify that the Nginx configuration contains the backend service:
proxy_pass http://backend:5000/api/;
________________________________________
Docker Hub
Backend image:
https://hub.docker.com/r/soham5492/secure-alumni-backend
Frontend image:
https://hub.docker.com/r/soham5492/secure-alumni-frontend
________________________________________
Project Workflow
The containerized workflow is:
Developer
    |
    v
GitHub Repository
    |
    v
Docker Build
    |
    +-----------------------+
    |                       |
    v                       v
Backend Image         Frontend Image
    |                       |
    +----------+------------+
               |
               v
          Docker Hub
               |
               v
        Docker Compose
               |
       +-------+-------+
       |               |
       v               v
   Backend          Frontend
   Container        Container
       |               |
       +-------+-------+
               |
               v
           Application

________________________________________
License
This project is intended for educational and project demonstration purposes.
________________________________________
Author
Soham
Secure Alumni Management and Engagement Platform with Integrated Web Application Security Monitoring and Intrusion Detection System.

A couple of important corrections from the earlier README-style material: your **current Docker setup is the two-image Compose architecture**, not the old single `secure-alumni-platform:latest` image. Also, your current Compose setup expects `MONGODB_URI` and `JWT_SECRET` from the environment, while the actual secret values should never be placed in the README. Your verified Docker setup uses the backend and frontend `:latest` images and exposes the frontend on port `8080`.
