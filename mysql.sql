DROP DATABASE IF EXISTS business_db;
CREATE DATABASE business_db;
USE business_db;

CREATE TABLE departments (
	id INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(30) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE roles (
	id INT AUTO_INCREMENT NOT NULL,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL (10, 3) NOT NULL,
    department_id INT NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE employees (
id INT AUTO_INCREMENT NOT NULL,
firstName VARCHAR(30) NOT NULL,
lastName VARCHAR(30) NOT NULL,
role_id INT NOT NULL,
manager_id INT DEFAULT NULL,
PRIMARY KEY(id)
);

INSERT INTO departments (name)
VALUES ("Sales"), ("Engineering"), ("Finance"), ("Legal");

INSERT INTO roles (title, salary, department_id)
VALUES ("Sales Lead", 100000, 1), ("Salesperson", 80000, 1), ("Lead Engineer", 150000, 2), ("Software Engineer", 120000, 2),
("Accountant", 125000, 3), ("Legal Team Lead", 250000, 4), ("Lawyer", 190000, 4);

INSERT INTO employees (firstName, lastName, role_id, manager_id)
VALUES ("John", "Doe", 1, null), ("Mike", "Chan", 2, 1), ("Ashley", "Rodriguez", 3, null), ("Kevin", "Tupik", 4, 3), ("Malia", "Brown", 5, null), ("Sarah", "Lourd", 6, null), ("Tom", "Allen", 7, 6);

