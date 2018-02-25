Rails.application.routes.draw do

  get 'users/new'

    scope '/transactions' do 
        get '/' => 'transactions#index'
    end

end
