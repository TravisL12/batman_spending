class V1::TransactionsController < ApplicationController

    def create 
        Transaction.create(transaction_params)
    end

    def index
        year = params[:year].to_i > 0 ? params[:year].to_i : 2017
        date = DateTime.new(year)
        beginning_date = date.beginning_of_year
        end_date = date.end_of_year

        @data = {}
        trans = Transaction.joins(:category).where(:date => beginning_date..end_date);
        p trans

        @data[year] = {
            'month' => {},
            'total' => trans.map(&:amount).inject(0,&:+) / 100
        }

        months_grouped = trans.group_by{ |tran| tran.date.month }
        months_grouped.each do |month, trans2|
            @data[year]['month'][month] = {
                'day' => [],
                'total' => trans2.map(&:amount).inject(0,&:+) / 100
            }

            days_grouped = trans2.group_by{ |tran| tran.date.day }
            days_in_month = Date.new(year, month, -1)

            1.upto(days_in_month.day) do |day|
                @data[year]['month'][month]['day'].push({
                    'day' => day,
                    'total' => 0,
                    'transactions' => days_grouped[day] || []
                    })

                if (days_grouped[day])
                    days_grouped[day].each do |transaction|
                        @data[year]['month'][month]['day'][-1]['total'] += transaction.amount / 100
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
