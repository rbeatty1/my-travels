# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2022_04_06_012028) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "destinations", force: :cascade do |t|
    t.bigint "trip_id", null: false
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["trip_id"], name: "index_destinations_on_trip_id"
  end

  create_table "locations", force: :cascade do |t|
    t.bigint "destination_id", null: false
    t.string "name"
    t.string "street_address"
    t.string "city"
    t.string "zip"
    t.decimal "lat"
    t.decimal "long"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "location_type"
    t.datetime "date"
    t.index ["destination_id"], name: "index_locations_on_destination_id"
  end

  create_table "trips", force: :cascade do |t|
    t.datetime "start_date"
    t.datetime "end_date"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "trip_type"
    t.integer "region"
  end

  add_foreign_key "destinations", "trips"
  add_foreign_key "locations", "destinations"
end
