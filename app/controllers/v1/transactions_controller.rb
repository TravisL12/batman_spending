class V1::TransactionsController < ApplicationController

    def create 
        Transaction.create(transaction_params)
    end

    def index
        year = params[:year].to_i > 0 ? params[:year].to_i : 2017
        date = Date.new(year)
        year_start_date = date.beginning_of_year
        year_end_date = date.end_of_year

        @data = {}
        transactions = Transaction.joins(:category).where(:date => year_start_date..year_end_date);

        @data[year] = {
            'month' => {},
            'total' => transactions.map(&:amount).inject(0,&:+)
        }

        months_grouped = transactions.group_by{ |tran| tran.date.month }
        months_grouped.each do |month, trans|
            @data[year]['month'][month] = {
                'day' => [],
                'total' => trans.map(&:amount).inject(0,&:+)
            }

            days_grouped = trans.group_by{ |tran| tran.date.day }
            days_in_month = Date.new(year, month, -1)

            1.upto(days_in_month.day) do |day|
                @data[year]['month'][month]['day'].push({
                    'day' => day,
                    'total' => 0,
                    'transactions' => days_grouped[day] || []
                    })

                if (days_grouped[day])
                    days_grouped[day].each do |transaction|
                        @data[year]['month'][month]['day'][-1]['total'] += transaction.amount
                    end
                end
            end
        end

        render json: @data
    end

    private 

    def transaction_params
        params.require(:transaction).permit(:description, :amount, :date)
    end

end
