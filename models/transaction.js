const { Op } = require("sequelize");
const {
  forEach,
  groupBy,
  keyBy,
  map,
  sortBy,
  sumBy,
  uniqBy
} = require("lodash");
const substrings = require("common-substrings");

module.exports = (sequelize, DataTypes) => {
  const CategoryModel = sequelize.models.Category;
  const Transaction = sequelize.define(
    "Transaction",
    {
      description: DataTypes.STRING,
      amount: DataTypes.INTEGER,
      date: DataTypes.DATE,
      category_id: DataTypes.INTEGER,
      subcategory_id: DataTypes.INTEGER,
      payee: DataTypes.STRING,
      user_id: DataTypes.INTEGER
    },
    {}
  );

  // INCORPORATE THIS - (DONE!!!!!)
  // Transaction.groupByPayee
  // select c.name, payee, count(*) count
  //    from transactions
  //    join categories c on c.id=transactions.category_id
  //    where date >= '2018-1-01 00:00:00' and not payee=''
  //    group by payee, category_id
  //    order by count desc;

  Transaction.groupSumPayees = function(transactionData) {
    const payee = transactionData.map(t => {
      return t.get("payee") || "none";
    });

    const tree = substrings.weigh(payee, {
      minLength: 8,
      minOccurrence: 4
    });

    return tree.map(({ name, source }) => {
      // loop through sources and combine for spending per month, not just the sum
      const groupedTransactions = source.map(i => {
        return transactionData[i];
      });
      const groupByMonth = Transaction.groupByYearMonth(groupedTransactions);
      const sum = sumBy(source, i => {
        return +transactionData[i].amount;
      });

      return { groupByMonth, name: name, sum, count: source.length };
    });

    // Other way of doing it
    // const payees = groupBy(transactionData, t => {
    //   return t.get("payee") || "none";
    // });
    // const payeeSum = [];
    // forEach(payees, (trans, payee) => {
    //   const sum = sumBy(trans, "amount");
    //   payeeSum.push({ name: payee, sum });
    // });

    // const sorted = sortBy(payeeSum, [{ sum: "desc" }]);
    // return sorted;
  };

  Transaction.listYears = function(userId) {
    // select distinct(date_format(date, '%Y')) year from transactions order by year;
    return Transaction.findAll({
      attributes: [
        [sequelize.literal("DISTINCT(date_format(date, '%Y'))"), "year"]
      ],
      where: {
        user_id: userId
      }
    });
  };

  Transaction.groupYear = function(transactionData) {
    return groupBy(transactionData, trans => {
      return new Date(trans.date).getFullYear();
    });
  };

  Transaction.groupMonth = function(transactionData) {
    return groupBy(transactionData, trans => {
      return new Date(trans.date).getMonth() + 1;
    });
  };

  Transaction.groupDay = function(transactionData) {
    return groupBy(transactionData, trans => {
      return new Date(trans.date).getDate();
    });
  };

  /**
   * Takes transactions and groups them in year-month objects
   * 2018: { // year
   *     2: { // month (Feb)
   *     }
   * }
   */
  Transaction.groupByYearMonth = function(transactionData) {
    const transactions = Transaction.groupYear(transactionData);

    forEach(transactions, (tYear, year) => {
      transactions[year] = Transaction.groupMonth(transactions[year]);
    });

    return transactions;
  };

  /**
   * Takes transactions and groups them in year-month objects
   * 2018: { // year
   *     2: { // month (Feb)
   *        5: [ // day
   *            ...transactions
   *           ]
   *     }
   * }
   */
  Transaction.groupByYearMonthDay = function(transactionData) {
    const transactions = Transaction.groupYear(transactionData);
    const categories = Object.keys(transactions).reduce((result, year) => {
      result[year] = {};
      return result;
    }, {});
    const allCategories = keyBy(
      uniqBy(map(transactionData, "Category"), "id"),
      "id"
    );

    forEach(transactions, (tYear, year) => {
      transactions[year] = Transaction.groupMonth(transactions[year]);

      // Filter Transaction data by day (date)
      forEach(transactions[year], (tMonth, month) => {
        categories[year][month] = CategoryModel.groupMonth(
          tMonth,
          allCategories
        );
        transactions[year][month] = {
          days: Transaction.groupDay(transactions[year][month]),
          payees: Transaction.groupSumPayees(tMonth)
        };
      });
    });

    return { transactions, categories };
  };

  /**
    Get spending for range of dates
    Default to current month and year
    userId: integer - foreign key of transactions to get
    options: Object
       startDate - starting date of transactions
       endDate - end date of transactions
       excludeCategoryIds - categories to ignore
   */
  Transaction.getDates = function(userId, options) {
    const queryParams = {
      user_id: userId,
      category_id: {
        [Op.not]: options.excludeCategoryIds
      },
      date: {
        $gte: options.startDate,
        $lt: options.endDate
      }
    };

    return Transaction.findAll({
      where: queryParams,
      order: [["date", "ASC"]],
      include: [
        {
          model: CategoryModel,
          as: "Category",
          where: {
            user_id: userId
          }
        }
      ]
    });
  };

  Transaction.createNew = async (data, user) => {
    if (data["Category"] === "Deposits") {
      return false;
    }

    let category =
      data["Master Category"] || data["category"] || data["Category"];
    let subcategory = data["Subcategory"] || data["subcategory"];
    let date = data["Date"] || data["date"];
    let payee = data["Payee"] || data["payee"] || data["Simple Description"];
    let description =
      data["Description"] ||
      data["description"] ||
      data["Original Description"];
    let amount = data["Amount"] || data["amount"];

    description = description.replace(/\s+/g, " "); // Trim extra spaces
    amount = +amount.replace(/[$,]/g, "") * 100; // remove $ or ',' separators
    category = !category ? "None" : category;
    subcategory = !subcategory ? "None" : subcategory;

    // Parse out date values from description
    // these dates are more accurate of the actual transaction date
    const re = new RegExp(/((^\d{1,2}|\s\d{1,2})\/\d{2}\s)/);
    const newDate = description.match(re);

    if (newDate) {
      const year = new Date(date).getFullYear(); // used to get the year
      date = [newDate[0].trim(), year].join("/");
    }

    const createdAt = new Date();
    const updatedAt = new Date();

    const [categoryObj, isCreated] = await CategoryModel.findOrCreate({
      where: {
        name: category,
        user_id: user.id
      },
      defaults: {
        user_id: user.id
      }
    });

    const [subcategoryObj, isSubCreated] = await CategoryModel.findOrCreate({
      where: {
        name: subcategory,
        user_id: user.id
      },
      defaults: {
        parent_category_id: categoryObj.id,
        user_id: user.id
      }
    });

    return Transaction.create({
      description,
      payee,
      amount: Math.abs(amount),
      date: new Date(date),
      user_id: user.id,
      category_id: categoryObj.id,
      subcategory_id: subcategoryObj.id,
      createdAt,
      updatedAt
    });
  };

  Transaction.associate = ({ User, Category }) => {
    Transaction.belongsTo(User, {
      foreignKey: "user_id"
    });
    Transaction.belongsTo(Category, {
      foreignKey: "category_id",
      as: "Category"
    });
    Transaction.belongsTo(Category, {
      foreignKey: "subcategory_id",
      as: "Subcategory"
    });
  };

  return Transaction;
};
