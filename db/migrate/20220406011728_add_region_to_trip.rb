class AddRegionToTrip < ActiveRecord::Migration[7.0]
  def change
    add_column :trips, :region, :integer
  end
end
