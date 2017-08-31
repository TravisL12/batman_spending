class CreateTransactions < ActiveRecord::Migration[5.1]
    def change
        create_table :transactions do |t|
            t.datetime :date
            t.string :description
            t.integer :amount
            t.string :location
            t.string :payee
            t.string :method

            t.timestamps
        end
    end
end
