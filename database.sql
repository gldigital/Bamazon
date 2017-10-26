DROP DATABASE IF EXISTS bamazon_db;
create database bamazon_db;

use bamazon_db;

create table products (
    id INT not null auto_increment,
    product_name VARCHAR(50) not null,
    department_name varchar(50) not null,
    price INT DEFAULT 0,
    stock_quantity INT DEFAULT 0,
    PRIMARY KEY (id)
);

INSERT INTO products (id, product_name, department_name, price, stock_quantity)
VALUES (1, "basketball", "sports", 10, 5 );

INSERT INTO products (id, product_name, department_name, price, stock_quantity)
VALUES (2, "soccer ball", "sports", 15, 5 );

INSERT INTO products (id, product_name, department_name, price, stock_quantity)
VALUES (3, "football", "sports", 20, 5 );

SELECT * FROM products;