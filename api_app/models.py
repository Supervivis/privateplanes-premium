from django.db import models


class Aircraft(models.Model):
    aircraft_name = models.CharField(max_length=200, default="")
    model = models.CharField(max_length=200, default="")

    class Category(models.TextChoices):
        Large = "Large"
        Medium = "Medium"
        Light = "Light"
        VLJ = "VLJ"
        Prop = "Prop"
    aircraft_manufacturer = models.TextField(default="")
    category = models.TextField(choices=Category.choices, default="")
    max_pax = models.FloatField(default=0)
    typical_pax = models.FloatField(default=0)
    cabin_noise = models.FloatField(default=0)
    cabin_altitude = models.FloatField(default=0)
    cabin_pressure = models.FloatField(default=0)
    pressure_differential_psi = models.FloatField(default=0)
    sea_level_cabin = models.FloatField(default=0)
    range_NM = models.FloatField(default=0)
    range_Miles = models.FloatField(default=0)
    range_decrease_per_passenger = models.FloatField(default=0)
    seat_full_range_NM = models.FloatField(default=0)
    ferr_range_NM = models.FloatField(default=0)
    high_cruise_MPH = models.FloatField(default=0)
    high_cruise_Mach = models.FloatField(default=0)
    high_cruise_knots = models.FloatField(default=0)
    long_range_cruise_knots = models.FloatField(default=0)
    long_range_cruise_MPH = models.FloatField(default=0)
    long_range_cruise_Mach = models.FloatField(default=0)
    ceiling_feet = models.FloatField(default=0)
    TO_distance_feet = models.FloatField(default=0)
    landing_distance_feet = models.FloatField(default=0)
    rate_climb = models.FloatField(default=0)
    initial_cruise_altitude = models.FloatField(default=0)
    ext_length_feet = models.FloatField(default=0)
    wingspan_feet = models.FloatField(default=0)
    exterior_height_feet = models.FloatField(default=0)
    hangar_space_SF = models.FloatField(default=0)
    int_length_feet = models.FloatField(default=0)
    int_width_feet = models.FloatField(default=0)
    int_height_feet = models.FloatField(default=0)
    cabin_volume_CF = models.FloatField(default=0)
    ratio = models.FloatField(default=0)
    door_width_feet = models.FloatField(default=0)
    door_height_feet = models.FloatField(default=0)
    MTOW_lbs = models.FloatField(default=0)
    max_ramp_weight_lbs = models.FloatField(default=0)
    max_landing_weight_lbs = models.FloatField(default=0)
    max_payload_lbs = models.FloatField(default=0)
    available_fuel_lbs = models.FloatField(default=0)
    useful_load_lbs = models.FloatField(default=0)
    basic_operating_weight_lbs = models.FloatField(default=0)
    baggage_capacity_CF = models.FloatField(default=0)
    internal_baggage_CF = models.FloatField(default=0)
    external_baggage_CF = models.FloatField(default=0)
    baggage_weight_lbs = models.FloatField(default=0)
    a_check = models.CharField(max_length=200, default="", blank=False)
    b_check = models.CharField(max_length=200, default="", blank=False)
    c_check = models.CharField(max_length=200, default="", blank=False)
    d_check = models.CharField(max_length=200, default="", blank=False)
    living_zones = models.FloatField(default=0)
    engine_manufacturer = models.CharField(max_length=200, default="")
    engine_model = models.CharField(max_length=200, default="")
    thrust_output_lbs = models.FloatField(default=0)
    total_thrust_lbs = models.FloatField(default=0)
    hourly_fuel_burn_GPH = models.FloatField(default=0)
    lateral_db = models.FloatField(default=0)
    flyover_db = models.FloatField(default=0)
    approach_db = models.FloatField(default=0)
    production_start = models.CharField(max_length=200, default="")
    production_end = models.CharField(max_length=200, default="")
    in_production = models.BooleanField(default=0)
    number_made = models.FloatField(default=0)
    number_in_service = models.FloatField(default=0)
    minimum_pilots = models.FloatField(default=0)
    serial_numbers = models.FloatField(default=0)
    dispatch_reliability = models.FloatField(default=0)
    single_pilot_certified = models.BooleanField(default=0)
    toilet = models.BooleanField(default=0)
    shower = models.BooleanField(default=0)
    baggage_access = models.BooleanField(default=0)
    space_to_sleep = models.BooleanField(default=0)
    dedicated_bed = models.BooleanField(default=0)
    typical_avionic_suite = models.CharField(max_length=200, default="")
    flat_floor = models.BooleanField(default=0)
    lving_zone_count = models.FloatField(default=0)
    initial_crew_training_days = models.FloatField(default=0)
    recurrent_crew_training_days = models.FloatField(default=0)
    upgrade_crew_training_days = models.FloatField(default=0)
    estimated_hourly_charter = models.FloatField(default=0)
    hourly_ownership_rate_NAmerica = models.FloatField(default=0)
    profit_on_charter = models.FloatField(default=0)
    new_purchase = models.FloatField(default=0)
    average_pre_owned = models.FloatField(default=0)
    depreication_rate = models.FloatField(default=0)
    annual_cost = models.FloatField(default=0)

    cabin_altitude_ceiling_meters = models.FloatField(default=0)
    altitude_sea_level_meters = models.FloatField(default=0)
    range_km = models.FloatField(default=0)
    high_speed_cruise_kmh = models.FloatField(default=0)
    long_range_cruise_kmh = models.FloatField(default=0)
    ceiling_meters = models.FloatField(default=0)
    TO_distance_meters = models.FloatField(default=0)
    landing_distance_meters = models.FloatField(default=0)
    rate_climb_meters = models.FloatField(default=0)
    initial_cruise_altitude_meters = models.FloatField(default=0)

    ext_length_meters = models.FloatField(default=0)
    wingspan_meters = models.FloatField(default=0)
    ext_height_meters = models.FloatField(default=0)
    hangar_space_square_meters = models.FloatField(default=0)
    int_length_meters = models.FloatField(default=0)
    int_width_meters = models.FloatField(default=0)
    int_height_meters = models.FloatField(default=0)
    cabin_volume_cubicmeters = models.FloatField(default=0)
    door_width_meters = models.FloatField(default=0)
    door_height_meters = models.FloatField(default=0)

    MTOW_kgs = models.FloatField(default=0)
    max_ramp_weight_kgs = models.FloatField(default=0)
    max_landing_weight_kgs = models.FloatField(default=0)
    max_payload_kgs = models.FloatField(default=0)
    available_fuel_kgs = models.FloatField(default=0)
    useful_payloads_kgs = models.FloatField(default=0)
    basic_operating_weight_kgs = models.FloatField(default=0)
    baggage_capacity_cubicmeters = models.FloatField(default=0)
    internal_baggage_cubicmeters = models.FloatField(default=0)
    external_baggage_cubicmeters = models.FloatField(default=0)
    baggage_weight_kgs = models.FloatField(default=0)

    thrust_output_kgs = models.FloatField(default=0)
    total_thrust_kgs = models.FloatField(default=0)
    hourly_fuel_burn_LPH = models.FloatField(default=0)
    max_altitude_feet = models.FloatField(default=0)
    max_altitude_meters = models.FloatField(default=0)

    average_mission_length = models.FloatField(default=0)

    key_facts = models.TextField(default="")

    aircraft_image = models.TextField(default="")
    floorplan_drawing = models.TextField(default="")

    NA_annual_captain = models.FloatField(default=0)
    NA_annual_first_office = models.FloatField(default=0)
    NA_annual_employee_benefits = models.FloatField(default=0)
    NA_annual_crew_training = models.FloatField(default=0)
    NA_annual_hangar = models.FloatField(default=0)
    NA_annual_insurance_hull = models.FloatField(default=0)
    NA_annual_insurance_liability = models.FloatField(default=0)
    NA_annual_management = models.FloatField(default=0)
    NA_annual_misc = models.FloatField(default=0)
    NA_annual_deprecation = models.FloatField(default=0)
    NA_annual_total = models.FloatField(default=0)
    NA_hourly_fuel = models.FloatField(default=0)
    NA_hourly_maintenance = models.FloatField(default=0)
    NA_hourly_engine_overhaul = models.FloatField(default=0)
    NA_hourly_ground_fees = models.FloatField(default=0)
    NA_hourly_misc = models.FloatField(default=0)
    NA_hourly_total = models.FloatField(default=0)

    EU_annual_captain = models.FloatField(default=0)
    EU_annual_first_office = models.FloatField(default=0)
    EU_annual_employee_benefits = models.FloatField(default=0)
    EU_annual_crew_training = models.FloatField(default=0)
    EU_annual_hangar = models.FloatField(default=0)
    EU_annual_insurance_hull = models.FloatField(default=0)
    EU_annual_insurance_liability = models.FloatField(default=0)
    EU_annual_management = models.FloatField(default=0)
    EU_annual_misc = models.FloatField(default=0)
    EU_annual_deprecation = models.FloatField(default=0)
    EU_annual_total = models.FloatField(default=0)
    EU_hourly_fuel = models.FloatField(default=0)
    EU_hourly_maintenance = models.FloatField(default=0)
    EU_hourly_engine_overhaul = models.FloatField(default=0)
    EU_hourly_ground_fees = models.FloatField(default=0)
    EU_hourly_misc = models.FloatField(default=0)
    EU_hourly_total = models.FloatField(default=0)

    SA_annual_captain = models.FloatField(default=0)
    SA_annual_first_office = models.FloatField(default=0)
    SA_annual_employee_benefits = models.FloatField(default=0)
    SA_annual_crew_training = models.FloatField(default=0)
    SA_annual_hangar = models.FloatField(default=0)
    SA_annual_insurance_hull = models.FloatField(default=0)
    SA_annual_insurance_liability = models.FloatField(default=0)
    SA_annual_management = models.FloatField(default=0)
    SA_annual_misc = models.FloatField(default=0)
    SA_annual_deprecation = models.FloatField(default=0)
    SA_annual_total = models.FloatField(default=0)
    SA_hourly_fuel = models.FloatField(default=0)
    SA_hourly_maintenance = models.FloatField(default=0)
    SA_hourly_engine_overhaul = models.FloatField(default=0)
    SA_hourly_ground_fees = models.FloatField(default=0)
    SA_hourly_misc = models.FloatField(default=0)
    SA_hourly_total = models.FloatField(default=0)

    AS_annual_captain = models.FloatField(default=0)
    AS_annual_first_office = models.FloatField(default=0)
    AS_annual_employee_benefits = models.FloatField(default=0)
    AS_annual_crew_training = models.FloatField(default=0)
    AS_annual_hangar = models.FloatField(default=0)
    AS_annual_insurance_hull = models.FloatField(default=0)
    AS_annual_insurance_liability = models.FloatField(default=0)
    AS_annual_management = models.FloatField(default=0)
    AS_annual_misc = models.FloatField(default=0)
    AS_annual_deprecation = models.FloatField(default=0)
    AS_annual_total = models.FloatField(default=0)
    AS_hourly_fuel = models.FloatField(default=0)
    AS_hourly_maintenance = models.FloatField(default=0)
    AS_hourly_engine_overhaul = models.FloatField(default=0)
    AS_hourly_ground_fees = models.FloatField(default=0)
    AS_hourly_misc = models.FloatField(default=0)
    AS_hourly_total = models.FloatField(default=0)

    NA_fuel_costs = models.FloatField(default=0)
    EU_fuel_costs = models.FloatField(default=0)
    SA_fuel_costs = models.FloatField(default=0)
    AS_fuel_costs = models.FloatField(default=0)

    acquisition_values = models.TextField(default="")
    historical_data = models.TextField(default="")
    fleet_flight_link = models.CharField(max_length=200, default="")

    def __str__(self):
        return self.aircraft_name

class Accident(models.Model):
    country = models.CharField(
        max_length=200, default="", null=True, blank=True)
    aircraft_incident = models.ForeignKey(
        Aircraft, on_delete=models.CASCADE, null=True, blank=True)
    reg = models.CharField(max_length=200, null=True, blank=True)
    date = models.CharField(max_length=200, null=True, blank=True)
    occurrence = models.CharField(
        max_length=200, null=True, blank=True)
    details = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return str(self.aircraft_incident)

class Question(models.Model):
    user_name = models.CharField(
        max_length=200, null=False, blank=False
    )
    date = models.DateField(),
    limit = models.IntegerField(default = 30)

    def __str__(self):
        return self.user_name