const inquirer = require("inquirer");
const mysql = require("mysql");
require("console.table");
require("dotenv").config();

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.MYSQL_PASS,
    database: "business_db"
});

connection.connect(function (err) {
    if (err) throw err;
    queryPrompt();
})

let splitArr = [];
let newArr = [];
let newId = 0;
let savedId = 0;

function queryPrompt() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["View", "Add", "Remove", "Update"],
            name: "option"
        }
    ]).then(function (answer) {
        switch (answer.option) {
            case "View": viewPrompt();
                break;
            case "Add": addPrompt();
                break;
            case "Remove": removePrompt();
                break;
            case "Update": updatePrompt();
                break;
            default: connection.end();
        }
    })
}

function viewPrompt() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to view?",
            choices: ["Employees", "Roles", "Departments", "Budget"],
            name: "option"
        }
    ]).then(function (answer) {
        switch (answer.option) {
            case "Employees": viewEmp();
                break;
            case "Roles": viewRoles();
                break;
            case "Departments": viewDept();
                break;
            case "Budget": viewBudget();
                break;
            default: connection.end();
        }
    })
}

function addPrompt() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to add?",
            choices: ["Employee", "Role", "Department"],
            name: "option"
        }
    ]).then(function (answer) {
        switch (answer.option) {
            case "Employee": addEmp();
                break;
            case "Role": addRole();
                break;
            case "Department": addDept();
                break;
            default: connection.end();
        }
    })
}

function removePrompt() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to remove?",
            choices: ["Employee", "Role", "Department"],
            name: "option"
        }
    ]).then(function (answer) {
        switch (answer.option) {
            case "Employee": removeEmp();
                break;
            case "Role": removeRole();
                break;
            case "Department": removeDept();
                break;
            default: connection.end();
        }
    })
}

function updatePrompt() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to update?",
            choices: ["Employee role", "Employee manager"],
            name: "option"
        }
    ]).then(function (answer) {
        switch (answer.option) {
            case "Employee role": updateEmp();
                break;
            case "Employee manager": updateManager();
                break;
            default: connection.end();
        }
    })
}

function viewEmp() {
    connection.query("SELECT employees.id AS ID, employees.firstName AS FirstName, employees.lastName AS LastName, roles.title AS Title, departments.name AS Department, roles.salary AS Salary, employees.manager_id AS Manager_ID FROM employees INNER JOIN roles ON roles.id = employees.role_id INNER JOIN departments ON departments.id = roles.department_id", function (err, res) {
        if (err) throw err;
        console.table(res)
        queryPrompt();
    })
}

function viewRoles() {
    connection.query("SELECT roles.title, roles.salary, departments.name AS department FROM roles INNER JOIN departments ON departments.id = roles.department_id", function (err, res) {
        if (err) throw err;
        console.table(res)
        queryPrompt();
    })
}

function viewDept() {
    connection.query("SELECT name FROM departments", function (err, res) {
        if (err) throw err;
        console.table(res)
        queryPrompt();
    })
}

function viewBudget() {
    connection.query("SELECT * FROM departments", function (err, res) {
        newArr = [];
        inquirer.prompt([
            {
                type: "list",
                message: "Of what department do you want to view the budget?",
                choices: function () {
                    for (let i = 0; i < res.length; i++) {
                        newArr.push(`${res[i].name}`)
                    }
                    return newArr;
                },
                name: "dept"
            }
        ]).then(function (answer) {
            for (let i = 0; i < res.length; i++) {
                if (answer.dept === res[i].name) {
                    connection.query("SELECT * FROM roles WHERE department_id = ?", [res[i].id], function (err, res) {
                        let salary = 0;
                        for (let i = 0; i < res.length; i++) {
                            salary += res[i].salary;
                        }
                        console.log("The budget for the " + answer.dept + " department is $" + salary)
                        queryPrompt();
                    })
                }
            }
        })
    })
}

function addEmp() {
    newArr = [];
    connection.query("SELECT * FROM roles", function (err, res) {
        inquirer.prompt([
            {
                type: "input",
                message: "What is the employee's first name?",
                name: "firstName"
            },
            {
                type: "input",
                message: "What is the employee's last name?",
                name: "lastName"
            },
            {
                type: "list",
                message: "What is the employee's role?",
                choices: function () {
                    for (let i = 0; i < res.length; i++) {
                        newArr.push(`${res[i].title}`)
                    }
                    return newArr;
                },
                name: "role"
            }
        ]).then(function (answer) {
            for (let i = 0; i < res.length; i++) {
                if (answer.role === res[i].title) {
                    answer.role = res[i].id;
                }
            }
            connection.query("INSERT INTO employees (firstName, lastName, role_id) VALUES (?, ?, ?)", [answer.firstName, answer.lastName, answer.role], function (err, data) {
                if (err) throw err;
                savedId = data.insertId;
            })
            addManager();
        })
    })
}

function addManager() {
    newArr = [];
    splitArr = [];
    connection.query("SELECT * FROM employees", function (err, res) {
        inquirer.prompt([
            {
                type: "list",
                message: "Who is the employee's manager?",
                choices: function () {
                    for (let i = 0; i < res.length; i++) {
                        newArr.push(`${res[i].firstName} ${res[i].lastName}`)
                    }
                    newArr.unshift("No manager")
                    return newArr;
                },
                name: "manager"
            }
        ]).then(function (answer) {
            splitArr = answer.manager.split(" ");
            if (answer.manager === "No manager") {
                newId = null;
            } else {
                for (let i = 0; i < res.length; i++) {
                    if (splitArr[0] === res[i].firstName && splitArr[1] === res[i].lastName) {
                        newId = res[i].id;
                    }
                }
            }
            connection.query("UPDATE employees SET manager_id = ? WHERE id = ?", [newId, savedId], function (err, res) {
                if (err) throw err;
            })
            viewEmp();
        })
    })
}

function addRole() {
    newArr = [];
    connection.query("SELECT * FROM departments", function (err, res) {
        inquirer.prompt([
            {
                type: "input",
                message: "What is the name of the role?",
                name: "role"
            },
            {
                type: "input",
                message: "What is the salary of the role?",
                name: "salary"
            },
            {
                type: "list",
                message: "In what department is the role?",
                choices: function () {
                    for (let i = 0; i < res.length; i++) {
                        newArr.push(`${res[i].name}`)
                    }
                    return newArr;
                },
                name: "dept"
            }
        ]).then(function (answer) {
            for (let i = 0; i < res.length; i++) {
                if (answer.dept === res[i].name) {
                    let id = res[i].id
                    connection.query("INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)", [answer.role, answer.salary, id], function (err, res) {
                        if (err) throw err;
                    })
                    viewRoles();
                }
            }
        })
    })
}

function addDept() {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the name of the department?",
            name: "dept"
        }
    ]).then(function (answer) {
        connection.query("INSERT INTO departments (name) VALUES (?)", [answer.dept], function (err, res) {
            if (err) throw err;
        })
        viewDept();
    })
}

function removeEmp() {
    newArr = [];
    connection.query("Select firstName, lastName, id FROM employees", function (err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                type: "list",
                message: "Which employee do you want to remove?",
                choices: function () {
                    for (let i = 0; i < res.length; i++) {
                        newArr.push(`${res[i].firstName} ${res[i].lastName}`)
                    }
                    return newArr;
                },
                name: "employee"
            }
        ]).then(function (answer) {
            splitArr = answer.employee.split(" ");
            for (let i = 0; i < res.length; i++) {
                if (splitArr[0] === res[i].firstName && splitArr[1] === res[i].lastName) {
                    newId = res[i].id;
                    connection.query("DELETE FROM employees WHERE id = ?", [newId], function (err, res) {
                        if (err) throw err;
                    })
                    viewEmp();
                }
            }
        })
    })
}

function removeRole() {
    newArr = [];
    connection.query("Select * FROM roles", function (err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                type: "list",
                message: "Which role do you want to remove?",
                choices: function () {
                    for (let i = 0; i < res.length; i++) {
                        newArr.push(`${res[i].title}`)
                    }
                    return newArr;
                },
                name: "role"
            }
        ]).then(function (answer) {
            connection.query("DELETE FROM roles WHERE title = ?", [answer.role], function (err, res) {
                if (err) throw err;
            })
            viewRoles();
        })
    })
}

function removeDept() {
    newArr = [];
    connection.query("Select * FROM departments", function (err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                type: "list",
                message: "Which department do you want to remove?",
                choices: function () {
                    for (let i = 0; i < res.length; i++) {
                        newArr.push(`${res[i].name}`)
                    }
                    return newArr;
                },
                name: "dept"
            }
        ]).then(function (answer) {
            connection.query("DELETE FROM departments WHERE name = ?", [answer.dept], function (err, res) {
                if (err) throw err;
            })
            viewDept();
        })
    })
}

function updateEmp() {
    newArr = [];
    connection.query("Select firstName, lastName, id FROM employees", function (err, res) {
        inquirer.prompt([
            {
                type: "list",
                message: "Which employee do you want to update?",
                choices: function () {
                    for (let i = 0; i < res.length; i++) {
                        newArr.push(`${res[i].firstName} ${res[i].lastName}`)
                    }
                    return newArr;
                },
                name: "employee"
            }
        ]).then(function (answer) {
            splitArr = answer.employee.split(" ");
            newArr = [];
            connection.query("Select * FROM roles", function (err, res) {
                inquirer.prompt([
                    {
                        type: "list",
                        message: "What is the new role of the employee?",
                        choices: function () {
                            for (let i = 0; i < res.length; i++) {
                                newArr.push(`${res[i].title}`)
                            }
                            return newArr;
                        },
                        name: "role"
                    }
                ]).then(function (answer) {
                    for (let i = 0; i < res.length; i++) {
                        if (answer.role === res[i].title) {
                            let newId = res[i].id
                            connection.query("UPDATE employees SET role_id = ? WHERE firstName = ? AND lastName = ?", [newId, splitArr[0], splitArr[1]], function (err, res) {
                                if (err) throw err;
                            })
                            viewEmp();
                        }
                    }
                })
            })
        })
    })
}

function updateManager() {
    let newEmpArr = [];
    let splitEmpArr = [];
    let newManaArr = [];
    let splitManaArr = [];
    let newEmpId = 0;
    let newManaId = 0;

    connection.query("SELECT * FROM employees", function (err, res) {
        inquirer.prompt([
            {
                type: "list",
                message: "Whose manager do you want to update?",
                choices: function () {
                    for (let i = 0; i < res.length; i++) {
                        newEmpArr.push(`${res[i].firstName} ${res[i].lastName}`)
                    }
                    return newEmpArr;
                },
                name: "employee"
            },
            {
                type: "list",
                message: "Who is the employee's new manager?",
                choices: function () {
                    newArr = [];
                    for (let i = 0; i < res.length; i++) {
                        newManaArr.push(`${res[i].firstName} ${res[i].lastName}`)
                    }
                    newManaArr.unshift("No manager")
                    return newManaArr;
                },
                name: "manager"
            }
        ]).then(function (answer) {
            splitEmpArr = answer.employee.split(" ");
            for (let i = 0; i < res.length; i++) {
                if (splitEmpArr[0] === res[i].firstName && splitEmpArr[1] === res[i].lastName) {
                    newEmpId = res[i].id;
                }
            }

            splitManaArr = answer.manager.split(" ");
            if (answer.manager === "No manager") {
                newManaId = null;
            } else {
                for (let i = 0; i < res.length; i++) {
                    if (splitManaArr[0] === res[i].firstName && splitManaArr[1] === res[i].lastName) {
                        newManaId = res[i].id;
                    }
                }
            }
            connection.query("UPDATE employees SET manager_id = ? WHERE id = ?", [newManaId, newEmpId], function (err, res) {
                if (err) throw err;
            })
            viewEmp();
        })
    })
}