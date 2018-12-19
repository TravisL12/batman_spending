require 'csv'
require 'date'

user_1 = User.create(name: "Travis Lawrence", email: "travis.lawrence12@gmail.com",password: "password", password_confirmation: "password");
user_2 = User.create(name: "Connor", email: "connor@gmail.com",password: "password", password_confirmation: "password");

Category.create(:name => 'Uncategorized Payments', :category_type => 'category')

def import_data(user, file_name)
    file_path = "db/#{file_name}"
    uncategorized = category = Category.find_by(:name => 'Uncategorized Payments', :category_type => 'category');

    CSV.foreach(file_path, :headers => true) do |row|

        if (row["date"].nil?) 
            break
        end

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
            user_id: user.id
        )
    end

end

import_data(user_1, "transactions_seed_1.csv");
import_data(user_2, "transactions_seed_2.csv");
