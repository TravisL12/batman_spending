class Transaction < ApplicationRecord
    validates :amount, :uniqueness => { :scope => [:date, :description] }

    belongs_to :category
end
