var mysql = require('mysql');
var inquirer = require('inquirer');

function manager() {
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
    });

    /* ================================================
                    begin manager app function
    ==================================================*/
    var managerStart = function () {

        inquirer.prompt([{
                name: "managerChoice",
                type: "rawlist",
                choices: ["View Products", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"],
                message: "What would you like to do?"
            }

        ]).then(function (answer) {

            if (answer.managerChoice === "View Products") {
                viewProducts();
            }

            if (answer.managerChoice === "View Low Inventory") {
                viewLowInventory();
            }

            if (answer.managerChoice === "Add to Inventory") {
                addInventory();
            }

            if (answer.managerChoice === "Add New Product") {
                addNewProduct();
            }
            if (answer.managerChoice === "Exit") {
                connection.end();
            }

            // // switch case based on user input
            // switch(answer) {
            //     case answer.managerChoice == "View Products":
            //         viewProducts();
            //         break;

            //     case answer.managerChoice == "View Low Inventory":
            //         viewLowInventory();
            //         break;

            //     case answer.managerChoice == "Add to Inventory":
            //         addInventory();
            //         break;

            //     case answer.managerChoice == "Add New Product":
            //         addNewProduct();
            //         break;
            // }

        });

    }

    managerStart();

    /* ================================================
                    manage Functions
    ==================================================*/

    // manager view products
    var viewProducts = function () {
        // query to database to grab table
        connection.query("SELECT * FROM products", function (err, results) {

            if (err) throw err;

            console.log('');
            console.log("Your currrent products Sir.")
            console.log('');

            // Displaying items in the store
            for (var i = 0; i < results.length; i++) {
                console.log("  " + results[i].id + ") " + results[i].product_name + " | Price: $" + results[i].price + " | Quantity: " + results[i].stock_quantity);
            }
            console.log('');
            managerStart();
        });
    }

    var viewLowInventory = function () {
        // query to database to grab table
        connection.query("SELECT * FROM products", function (err, results) {

            if (err) throw err;

            console.log("");
            console.log("       Your Low Products");
            console.log("==============================================")
            // Displaying items in the store if they have a quantity less than 5
            for (var i = 0; i < results.length; i++) {

                if (results[i].stock_quantity < 5) {
                    console.log("  " + results[i].id + ") " + results[i].product_name + " | Price: $" + results[i].price + " | Quantity: " + results[i].stock_quantity);
                }
            }

            console.log('');
            managerStart();
        });
    }

    var addInventory = function () {
        // query to database to grab table
        connection.query("SELECT * FROM products", function (err, results) {

            if (err) throw err;

            // prompting manager which item and how many he wants to add
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
                        message: "Which item do you need to add to inventory for?"

                    },
                    {
                        name: "numberAdd",
                        type: "input",
                        message: "How many would you like to add to inventory?"
                    }

                ]).then(function (answer) {

                    // get the information of the chosen item
                    var chosenItem;
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].product_name == answer.choice) {
                            chosenItem = results[i];
                        }
                    }


                    // update stock_quantity
                    var query = "UPDATE products SET ? WHERE ? ";

                    var calculation = chosenItem.stock_quantity + parseInt(answer.numberAdd);
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
                        console.log("Quantity added to the inventory successfully!");
                        console.log('=====================================================================================');
                        console.log('');
                        viewProducts();
                        console.log('');
                        managerStart();

                    });
                });
        });
    }

    var addNewProduct = function () {
        // query to database to grab table
        connection.query("SELECT * FROM products", function (err, results) {

            if (err) throw err;

            // prompting manager to add new product
            inquirer
                .prompt([{

                        name: "productName",
                        type: "input",
                        message: "Product Name: "
                    },
                    {

                        name: "departmentName",
                        type: "input",
                        message: "Department Name: "
                    },
                    {

                        name: "price",
                        type: "input",
                        message: "Price: ",
                        validate: function (value) {
                            if (isNaN(value) === false) {
                                return true;
                            }
                            return false;
                        }
                    },
                    {

                        name: "stockQuantity",
                        type: "input",
                        message: "Stock Quantity: ",
                        validate: function (value) {
                            if (isNaN(value) === false) {
                                return true;
                            }
                            return false;
                        }
                    }

                ]).then(function (answer) {
                    // adding new product to database
                    connection.query(
                        "INSERT INTO products SET ?", {
                            product_name: answer.productName,
                            department_name: answer.departmentName,
                            price: answer.price,
                            stock_quantity: answer.stockQuantity
                        },
                        function (err) {
                            if (err) throw err;
                            console.log("You added your new product successfully!");
                            managerStart();
                        }
                    );
                });

        });

    }

}



module.exports = manager;