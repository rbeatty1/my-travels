class AddLocationTypeToLocation < ActiveRecord::Migration[7.0]
  def change
    add_column :locations, :location_type, :integer
  end
end
