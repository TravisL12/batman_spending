class CreateTransactions < ActiveRecord::Migration[5.1]
    def change
        create_table :transactions do |t|
            t.date :date
            t.string :description
            t.integer :amount
            t.string :location
            t.string :payee
            t.string :method
            t.integer :category_id

            t.timestamps
        end
    end
end
