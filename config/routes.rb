Rails.application.routes.draw do


  namespace :v1 do
    resources :transactions, only: [:create, :destroy]
    resources :users
    get '/transactions(/:year)', to: 'transactions#index'
    post 'user_token' => 'user_token#create'
  end

end
