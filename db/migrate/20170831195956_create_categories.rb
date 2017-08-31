class CreateCategories < ActiveRecord::Migration[5.1]
    def change
        create_table :categories do |t|
            t.string :name
            t.string :category_type
            t.integer :transaction_id

            t.timestamps
        end
    end
end
