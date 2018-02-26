Rails.application.routes.draw do

  get 'users/new'

  namespace :v1 do
    resources :transactions, only: [:create, :destroy]
    get '/transactions(/:year)', to: 'transactions#index'
  end

end
