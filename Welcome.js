var manager = require("./bamazonManager");
var customer = require("./bamazonCustomer");
var mysql = require('mysql');
var inquirer = require('inquirer');


var welcome = function () {

    inquirer.prompt([{
            name: "welcome",
            type: "rawlist",
            choices: ["Customer", "Manager"],
            message: "Are you a customer or manager?"
        }

    ]).then(function (answer) {

        if (answer.welcome === "Customer") {
            customer();
        }

        if (answer.welcome === "Manager") {
            manager();
        }
    })
}

welcome();