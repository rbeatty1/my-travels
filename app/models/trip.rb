class Trip < ApplicationRecord
  has_many :destinations, dependent: :destroy

  enum region: [:europe, :mid_atlantic, :mid_west, :northeast, :northwest, :pacific, :southeast, :southwest].freeze
  enum trip_type: [:event, :holiday, :professional, :vacation, :wedding].freeze
end
