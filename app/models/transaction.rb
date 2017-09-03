class Transaction < ApplicationRecord
    validates :amount, :uniqueness => { :scope => [:date, :description] }

    has_one :category
end
