class TransactionsController < ApplicationController

    def index
        @transaction = Transaction.joins(:category)
        render json: @transaction
    end

end
