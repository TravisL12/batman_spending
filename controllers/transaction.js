const Transaction = require("../models").Transaction;

module.exports = {
  list(req, res) {
    return Transaction.findAll()
      .then(users => res.status(200).send(users))
      .catch(error => {
        res.status(400).send(error);
      });
  },

  async add(req, res) {
    const {
      description,
      payee,
      amount,
      date,
      category,
      subcategory
    } = req.body;

    const createdAt = new Date();
    const updatedAt = new Date();
    const user = await models.User.find({
      where: { email: "travis@travis.com" }
    });
    const [categoryObj, isCreated] = await models.Category.findOrCreate({
      where: {
        name: category
      }
    });

    const [subcategoryObj, isSubCreated] = await models.Category.findOrCreate({
      where: {
        name: subcategory
      },
      defaults: {
        parent_category_id: category.id
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
    })
      .then(user => res.status(201).send(user))
      .catch(error => res.status(400).send(error));
  },

  getById(req, res) {
    return Transaction.findById(req.params.id)
      .then(transaction => {
        if (!transaction) {
          return res.status(404).send({
            message: "Transaction Not Found"
          });
        }
        return res.status(200).send(transaction);
      })
      .catch(error => res.status(400).send(error));
  }
};
