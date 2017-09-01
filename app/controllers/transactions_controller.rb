class TransactionsController < ApplicationController

    def index
        @trans = Transaction.joins(:category)

        # {
        #     2011 => {
        #         total: 1234,
        #         month => {
        #             total: 123,
        #             0 => {
        #                 total: 12,
        #                 day => []
        #             },
        #             1 => {
        #                 total: 34,
        #                 day => []
        #             }
        #         }
        #     },
        #     2012 => { ... },
        #     2013 => { ... },
        #     2014 => { ... },
        # }

        @data = {}
        @years_grouped = @trans.group_by{|tran| tran.date.year}

        @years_grouped.each do |year, trans|
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
                end
            end
        end

        render json: @data
    end

end
