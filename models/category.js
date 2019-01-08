"use strict";

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      parent_category_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("NOW()")
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("NOW()")
      }
    },
    { timestamps: true },
    {
      hooks: {
        validationFailed: (instance, options, error) => {
          console.warn(error);
        }
      }
    }
  );

  Category.associate = ({ User, Transaction }) => {
    Category.belongsTo(User, {
      foreignKey: "user_id"
    });
    Category.hasMany(Transaction, {
      foreignKey: "category_id",
      as: "Transactions"
    });
    Category.hasMany(Transaction, {
      foreignKey: "subcategory_id",
      as: "Subtransactions"
    });
    Category.belongsTo(Category, {
      foreignKey: "parent_category_id",
      as: "Category"
    });
    Category.hasMany(Category, {
      foreignKey: "parent_category_id",
      as: "Subcategory"
    });
  };
  return Category;
};
