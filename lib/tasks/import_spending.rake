require 'csv'
require 'date'

namespace :import_spending do
    desc "Import Spending"
    task add_spending_from_csv: :environment do
        uncategorized = Category.create(:name => 'Uncategorized Payments', :category_type => 'category')

        CSV.foreach("lib/tasks/All_Payment_Methods090117.csv", :headers => true) do |row|
            category = row["Master Category"]
            description = row["Description"]
            date = Date::strptime(row["Date"], "%m/%d/%y")
            puts description
            transaction = Transaction.create(
                date: date,
                location: row['Location'],
                payee: row['Payee'],
                description: row['Description'],
                method: row['Method'],
                amount: row['Amount'],
                )

            transaction.create_category(:name => category, :category_type => 'category')

        end

    end

end
