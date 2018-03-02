class ApplicationController < ActionController::API

  include Knock::Authenticable

  private

  def authenticate_v1_transaction
    authenticate_for Transaction
  end

end
