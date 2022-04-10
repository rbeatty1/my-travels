class Location < ApplicationRecord
  belongs_to :destination

  enum location_type: [:brewery, :cidery, :concert, :lodging, :museum, :park, :restaurant, :shopping, :sightseeing, :travel, :winery].freeze
end
