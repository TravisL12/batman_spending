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
  Category.associate = ({ Transaction }) => {
    Category.hasMany(Transaction, {
      foreignKey: "category_id"
    });
    Category.hasMany(Category, {
      foreignKey: "parent_category_id"
    });
    Category.belongsTo(Category, {
      foreignKey: "parent_category_id"
    });
  };
  return Category;
};
