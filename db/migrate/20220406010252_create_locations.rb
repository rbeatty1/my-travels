class CreateLocations < ActiveRecord::Migration[7.0]
  def change
    create_table :locations do |t|
      t.references :destination, null: false, foreign_key: true
      t.string :name
      t.string :street_address
      t.string :city
      t.string :zip
      t.decimal :lat
      t.decimal :long

      t.timestamps
    end
  end
end
