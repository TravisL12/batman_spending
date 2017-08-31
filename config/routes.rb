Rails.application.routes.draw do

    scope '/transactions' do 
        get '/' => 'transactions#index'
    end

end
