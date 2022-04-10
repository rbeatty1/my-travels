# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)
require 'faker'

10.times do
  destination_cnt = rand(1..5)
  d = Faker::Date.between(from: 5.years.ago, to: Date.today - 1.week)
  t = Trip.new(
    name: Faker::Address.city,
    trip_type: Trip.trip_types.keys[rand(5)],
    region: Trip.regions.keys[rand(Trip.regions.count)],
    start_date: d,
    end_date: d + rand(1..12).days
  )
  t.save!
  destination_cnt.times do
    location_cnt = rand(1..8)
    dest = Destination.new(
      name: Faker::Address.city,
      trip: t
    )
    dest.save!
    location_cnt.times do
      Location.create!(
        destination: dest,
        name: Faker::Address.community,
        street_address: Faker::Address.unique.street_address,
        city: dest.name,
        zip: Faker::Address.zip,
        date: Faker::Date.between(from: t.start_date, to: t.end_date),
        location_type: Location.location_types.keys[rand(10)],
        lat: Faker::Address.latitude,
        long: Faker::Address.longitude
      )
    end
  end
end