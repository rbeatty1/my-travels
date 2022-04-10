class Destination < ApplicationRecord
  belongs_to :trip
  has_many :locations, dependent: :destroy
end
