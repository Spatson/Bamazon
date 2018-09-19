let mysql = require("mysql");
let inquirer = require("inquirer");

let connection = mysql.createConnection({
  host: "localhost",

  port: 3306,
  user: "root",
  password: "password",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  connection.query(`SELECT * FROM products`, function(err, res) {
    if (err) throw err;
    console.log(res);
    shop();
  });
});

let shop = function() {
  inquirer
    .prompt([
      {
        type: "prompt",
        message: "What Is The ID Number of the Product You Would Like to Buy?",
        name: "id_to_buy"
      },
      {
        type: "prompt",
        message: "How Many Units Would You Like to Buy?",
        name: "quantity_to_buy"
      }
    ])
    .then(function(answer) {
      connection.query(
        `SELECT * from products where item_id = ${answer.id_to_buy} AND ${
          answer.quantity_to_buy
        } > 0`,
        function(err, results) {
          var chosenItem;
          for (var i = 0; i < results.length; i++) {
            if (results[i].item_name === answer.choice) {
              chosenItem = results[i];
            }
          }
          if (err) throw err;
          if (answer.quantity_to_buy > parseInt(chosenItem.stock)) {
            console.log(
              "Insufficient Quantity! Please Select Less of This Product Or Select a New Product and Quantity."
            );
            shop();
          } else {
            let costToCustomer =
              parseInt(answer.quantity_to_buy) * parseFloat(chosenItem.price);
            let newStock =
              parseInt(chosenItem.stock) - parseInt(answer.quantity_to_buy);
            connection.query(
              `UPDATE products SET ? where ?`,
              [
                {
                  stock: newStock
                },
                {
                  item_id: answer.id_to_buy
                }
              ],
              function(err, results) {
                if (err) throw err;
                console.log("Your Order Was Submitted!");
                console.log(
                  `Your Total Cost for ${answer.quantity_to_buy} units of ${
                    chosenItem.product_name
                  } is $ ${costToCustomer}`
                );
                shop();
              }
            );
          }
        }
      );
    });
};