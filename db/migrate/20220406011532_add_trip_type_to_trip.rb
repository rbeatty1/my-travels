class AddTripTypeToTrip < ActiveRecord::Migration[7.0]
  def change
    add_column :trips, :trip_type, :integer
  end
end
