require 'csv'
require 'date'

uncategorized = Category.create(:name => 'Uncategorized Payments', :category_type => 'category')

CSV.foreach("db/transactions_seed.csv", :headers => true) do |row|
    category = row["category"]
    description = row["description"]
    date = Date::strptime(row["date"], "%m/%d/%y")

    transaction = Transaction.create(
        date: date,
        location: row['location'],
        payee: row['payee'],
        description: row['description'],
        method: row['method'],
        amount: row['amount'],
    )

    transaction.create_category(:name => category, :category_type => 'category')

end
