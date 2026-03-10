# Fraudulent Transaction Detection System

This project is a full-stack simulation of a Fraudulent Transaction Detection System.  
It demonstrates how suspicious financial transactions can be monitored, analyzed, and stored using a simple rule-based risk evaluation model.

The system includes a responsive frontend dashboard for visualizing transaction activity and a Spring Boot backend that stores transaction records in a MySQL database.

## Project Overview

The application allows users to simulate financial transactions and evaluate their risk level based on predefined rules such as transaction amount, location patterns, and frequency.

When a transaction is processed, the system calculates a risk score and classifies the transaction as either normal or suspicious. The transaction details are then sent to a backend REST API and stored in a local MySQL database.

The frontend also visualizes transaction data using charts to help monitor risk trends and behavioral patterns.

## Technologies Used

Frontend:
- HTML
- CSS
- JavaScript

Backend:
- Java
- Spring Boot
- Spring Data JPA

Database:
- MySQL

Tools:
- Maven
- VS Code
- Git

## Backend Functionality

The backend is built using Spring Boot and exposes REST APIs to manage transaction data.

Endpoints:

GET /api/transactions  
Returns all stored transactions.

POST /api/transactions  
Saves a new transaction to the database.

Spring Data JPA is used to automatically map the Transaction entity to the MySQL database table.

CORS support is enabled so the frontend application can communicate with the backend server.

## Database Configuration

The application connects to a local MySQL database using Spring Boot configuration.

Example connection:

spring.datasource.url=jdbc:mysql://localhost:3306/fraud_detection?createDatabaseIfNotExist=true  
spring.datasource.username=root  
spring.datasource.password=YOUR_PASSWORD  

Hibernate automatically creates or updates the transactions table based on the entity structure.

## Frontend Functionality

The frontend dashboard allows users to:

- Simulate transaction activity
- View calculated risk scores
- Monitor suspicious transaction alerts
- Visualize risk patterns using charts

JavaScript fetch API is used to send transaction data to the backend REST API and retrieve stored transactions.

## How to Run the Project

1. Start MySQL server locally.

2. Configure the database credentials inside:
   src/main/resources/application.properties

3. Build the Spring Boot backend:

mvn clean install

4. Run the backend server:

mvn spring-boot:run

The backend will start at:

http://localhost:8080

5. Open the frontend by launching the index.html file in a browser.

The frontend will communicate with the backend API and store transaction data in MySQL.

## Purpose of the Project

This project demonstrates a basic fraud detection workflow combining:

- Frontend dashboard design
- REST API development
- Database integration
- Data visualization

It serves as a learning example for building full-stack applications using Java Spring Boot and MySQL.
