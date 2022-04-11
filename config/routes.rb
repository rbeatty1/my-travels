Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"

  get '/' => "trips#index"
  get '/client_library' => 'client_library#show' if Rails.env.development?
end
