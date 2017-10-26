var mysql = require('mysql');
var inquirer = require('inquirer');
var fs = require("fs");

function customer() {

    // setting up mysql connection
    var connection = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "",
        database: "bamazon_db"
    });

    connection.connect(function (err) {
        if (err) throw err;
        start();
    });

    // Asking user if they want to purchase or exit the store
    var start = function () {
        inquirer.prompt({
            name: "purchase",
            type: "rawlist",
            message: "Would you like to [purchase] items or [exit] the store? ",
            choices: ["purchase", "exit"]
        }).then(function (answer) {
            if (answer.purchase === "purchase") {
                purchaseItems();
            } else {
                connection.end();
            }
        })
    }
    // requesting manager to order more
    var tellManager = function () {
        var questions = [{
                type: 'input',
                name: 'full_name',
                message: 'Full Name:',
            },
            {
                type: 'input',
                name: 'item',
                message: 'Which Item? '
            },
            {
                type: 'input',
                name: 'itemQuant',
                message: 'How many items do you need? '
            }
        ];

        inquirer.prompt(questions).then(function (answers) {
            console.log('');
            // appending user's answers to itemRequests.txt
            fs.appendFile("itemRequests.txt", ", " + JSON.stringify(answers), function (err) {

                if (err) {
                    console.log(err);
                } else {

                    console.log('=====================================================================================');
                    console.log("Thank you! Your order has been placed and we will call you once it's in the store.");
                    console.log('=====================================================================================');
                    console.log('');
                }
                start();
            });
        });
    }

    // purchase item logic
    function purchaseItems() {

        // query to database to grab table
        connection.query("SELECT * FROM products", function (err, results) {

            if (err) throw err;

            console.log('');
            console.log("Welcome to Greg's Sports store. What would you like to purchase?")
            console.log('');

            // Displaying items in the store
            for (var i = 0; i < results.length; i++) {
                console.log("  " + results[i].id + ") " + results[i].product_name + " $" + results[i].price);
            }

            console.log('');

            // asking the user what they want to buy and the quantity
            inquirer
                .prompt([{
                        name: "choice",
                        type: "rawlist",
                        choices: function () {
                            var choiceArray = [];
                            for (var i = 0; i < results.length; i++) {
                                choiceArray.push(results[i].product_name);
                            }
                            return choiceArray;
                        },
                        message: "Choose an item you would like to purchase?"

                    },
                    {
                        name: "numberpurchase",
                        type: "input",
                        message: "How many would you like to purchase?"
                    }

                ])
                .then(function (answer) {

                    // get the information of the chosen item
                    var chosenItem;
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].product_name == answer.choice) {
                            chosenItem = results[i];
                        }
                    }

                    // updateing stock quantity
                    if (chosenItem.stock_quantity >= answer.numberpurchase) {

                        // if we have enough in stock update stock_quantity
                        var query = "UPDATE products SET ? WHERE ? ";

                        var calculation = chosenItem.stock_quantity - answer.numberpurchase;
                        var queryPerams = [{

                                stock_quantity: calculation
                            },
                            {
                                product_name: chosenItem.product_name
                            }
                        ]
                        connection.query(query, queryPerams, function (error, results) {
                            if (error) throw err;
                            console.log('');
                            console.log('=====================================================================================');
                            console.log("Item purchased successfully! Do you need anything else?");
                            console.log('=====================================================================================');
                            console.log('');
                            start();
                        });

                    } else {

                        // Showing we do not have enough in stock and askig customer if they would like to place an order
                        console.log("");
                        console.log('=====================================================================================');
                        console.log("You're crazy, we don't cary that much! We only have " + '"' + chosenItem.stock_quantity + '"' + " left.");
                        console.log('=====================================================================================');
                        console.log("");
                        inquirer.prompt({
                            name: "itemRequest",
                            type: "rawlist",
                            message: "Would you like to place an order and we will call you when it's fulfilled? ",
                            choices: ["Yes", "No"]
                        }).then(function (answer) {
                            if (answer.itemRequest === "Yes") {
                                console.log("");
                                tellManager();
                                console.log("");
                            } else {
                                console.log("");
                                start();
                            }
                        })

                    }
                });
        });
    }
}

module.exports = customer;