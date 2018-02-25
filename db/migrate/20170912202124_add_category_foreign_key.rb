class AddCategoryForeignKey < ActiveRecord::Migration[5.1]
    def change
        add_foreign_key :transactions, :categories
    end
end
