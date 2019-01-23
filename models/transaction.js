const _ = require("lodash");

module.exports = (sequelize, DataTypes) => {
  const Op = sequelize.Op;
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

  // INCORPORATE THIS
  // Transaction.groupByPayee
  // select c.name, payee, count(*) count
  //    from transactions
  //    join categories c on c.id=transactions.category_id
  //    where date >= '2018-1-01 00:00:00' and not payee=''
  //    group by payee, category_id
  //    order by count desc;

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

  /**
   * Takes transactions and groups them in year-month objects
   * {
   *    2018: { // year
   *        2: { // month (Feb)
   *             5: [ // day
   *                 Category: {},
   *                 ...transaction attributes
   *                ]
   *           }
   *         }
   * }
   *
   * Also groups categories and groups them in year-month-category_id
   * {
   *    2018: { // year
   *        2: { // month (Feb)
   *             35: { // category_id
   *                 ...category attributes
   *                }
   *           }
   *         }
   * }
   */
  Transaction.groupByYearMonth = function(transactionData) {
    const categories = {};
    const allCategories = _.keyBy(
      _.uniqBy(_.map(transactionData, "Category"), "id"),
      "id"
    );

    // Filter Transaction data by year
    const transactions = _.groupBy(transactionData, trans => {
      return new Date(trans.date).getFullYear();
    });

    // Filter Transaction data by month
    _.forEach(transactions, (tYear, year) => {
      transactions[year] = _.groupBy(transactions[year], trans => {
        return new Date(trans.date).getMonth() + 1;
      });

      categories[year] = {}; // initialize category year

      // Filter Transaction data by day (date)
      _.forEach(transactions[year], (tMonth, month) => {
        // Group all transactions into specific year-month by category_id
        categories[year][month] = tMonth.reduce((result, t) => {
          if (result[t.category_id]) {
            result[t.category_id].sum += t.amount;
          } else {
            result[t.category_id] = {
              ...allCategories[t.category_id].get({ plain: true }),
              sum: t.amount
            };
          }

          return result;
        }, {});

        transactions[year][month] = _.groupBy(
          transactions[year][month],
          trans => {
            return new Date(trans.date).getDate();
          }
        );
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
          model: sequelize.models.Category,
          as: "Category",
          where: {
            user_id: userId
          }
        }
      ]
    });
  };

  Transaction.createNew = async (data, user) => {
    let category = data["Master Category"] || data["category"];
    let subcategory = data["Subcategory"] || data["subcategory"];
    let date = data["Date"] || data["date"];
    let payee = data["Payee"] || data["payee"];
    let description = data["Description"] || data["description"];
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

    const [
      categoryObj,
      isCreated
    ] = await sequelize.models.Category.findOrCreate({
      where: {
        name: category,
        user_id: user.id
      },
      defaults: {
        user_id: user.id
      }
    });

    const [
      subcategoryObj,
      isSubCreated
    ] = await sequelize.models.Category.findOrCreate({
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
      amount,
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
