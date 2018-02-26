require 'csv'
require 'date'

default_user = User.create(name: "Travis Lawrence", email: "travis.lawrence12@gmail.com",password: "password", password_confirmation: "password");
uncategorized = Category.create(:name => 'Uncategorized Payments', :category_type => 'category')

CSV.foreach("db/transactions_seed.csv", :headers => true) do |row|
    category_row = row["category"]
    description = row["description"]
    date = Date::strptime(row["date"], "%m/%d/%y")

    if category_row
        category = Category.find_or_create_by(:name => category_row, :category_type => 'category')
    else
        category = uncategorized
    end

    Transaction.create(
        date: date,
        location: row['location'],
        payee: row['payee'],
        description: row['description'],
        method: row['method'],
        amount: row['amount'],
        category_id: category.id,
        user_id: default_user.id
    )
end
