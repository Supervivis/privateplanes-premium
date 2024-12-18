from django.views import View
from django.http import JsonResponse
from .models import Aircraft, Accident
from rest_framework.decorators import api_view
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.db.models import Q
from django.shortcuts import render
import csv
import io
from datetime import datetime
from django.contrib.auth.models import User
import json
from .mongo_utils import get_mongo_client


@method_decorator(csrf_exempt, name='dispatch')
class AircraftList(View):
    def get(self, request):
        aircrafts_number = Aircraft.objects.count()
        all_aircrafts = Aircraft.objects.all()
        aircrafts_data = []
        for item in all_aircrafts:
            aircrafts_data.append({
                'aircraft_id': item.id,
                'aircraft_name': item.aircraft_name,
                'aircraft_manufacturer': item.aircraft_manufacturer,
                'key_facts': item.key_facts,
                'model': item.model,
                'fleet_flight_link': item.fleet_flight_link,
                'category': item.category,
                'max_pax': item.max_pax,
                'typical_pax': item.typical_pax,
                "a_check": item.a_check,
                "b_check": item.b_check,
                "c_check": item.c_check,
                "d_check": item.d_check,
                "living_zones": item.living_zones,
                "baggage_access": item.baggage_access,
                "pressure_differential_psi": item.pressure_differential_psi,
                'cabin_noise': item.cabin_noise,
                'cabin_altitude': item.cabin_altitude,
                'cabin_pressure': item.cabin_pressure,
                'sea_level_cabin': item.sea_level_cabin,
                'range_NM': item.range_NM,
                'range_Miles': item.range_Miles,
                'range_decrease_per_passenger': item.range_decrease_per_passenger,
                'seat_full_range_NM': item.seat_full_range_NM,
                'ferr_range_NM': item.ferr_range_NM,
                'high_cruise_MPH': item.high_cruise_MPH,
                'high_cruise_Mach': item.high_cruise_Mach,
                'long_range_cruise_knots': item.long_range_cruise_knots,
                'long_range_cruise_MPH': item.long_range_cruise_MPH,
                'long_range_cruise_Mach': item.long_range_cruise_Mach,
                'ceiling_feet': item.ceiling_feet,
                'TO_distance_feet': item.TO_distance_feet,
                'landing_distance_feet': item.landing_distance_feet,
                'rate_climb': item.rate_climb,
                'initial_cruise_altitude': item.initial_cruise_altitude,
                'ext_length_feet': item.ext_length_feet,
                'wingspan_feet': item.wingspan_feet,
                'exterior_height_feet': item.exterior_height_feet,
                'hangar_space_SF': item.hangar_space_SF,
                'int_length_feet': item.int_length_feet,
                'int_width_feet': item.int_width_feet,
                'int_height_feet': item.int_height_feet,
                'cabin_volume_CF': item.cabin_volume_CF,
                'ratio': item.ratio,
                'door_width_feet': item.door_width_feet,
                'door_height_feet': item.door_height_feet,
                'MTOW_lbs': item.MTOW_lbs,
                'max_ramp_weight_lbs': item.max_ramp_weight_lbs,
                'max_landing_weight_lbs': item.max_landing_weight_lbs,
                'max_payload_lbs': item.max_payload_lbs,
                'available_fuel_lbs': item.available_fuel_lbs,
                'useful_load_lbs': item.useful_load_lbs,
                'basic_operating_weight_lbs': item.basic_operating_weight_lbs,
                'baggage_capacity_CF': item.baggage_capacity_CF,
                'internal_baggage_CF': item.internal_baggage_CF,
                'external_baggage_CF': item.external_baggage_CF,
                'baggage_weight_lbs': item.baggage_weight_lbs,
                'engine_manufacturer': item.engine_manufacturer,
                'engine_model': item.engine_model,
                'thrust_output_lbs': item.thrust_output_lbs,
                'total_thrust_lbs': item.total_thrust_lbs,
                'hourly_fuel_burn_GPH': item.hourly_fuel_burn_GPH,
                'lateral_db': item.lateral_db,
                'flyover_db': item.flyover_db,
                'approach_db': item.approach_db,
                'production_start': item.production_start,
                'production_end': item.production_end,
                'in_production': item.in_production,
                "high_cruise_knots": item.high_cruise_knots,
                'number_made': item.number_made,
                'number_in_service': item.number_in_service,

                'serial_numbers': item.serial_numbers,
                'minimum_pilots': item.minimum_pilots,
                'dispatch_reliability': item.dispatch_reliability,
                'single_pilot_certified': item.single_pilot_certified,
                'toilet': item.toilet,
                'shower': item.shower,
                'space_to_sleep': item.space_to_sleep,
                'dedicated_bed': item.dedicated_bed,
                'typical_avionic_suite': item.typical_avionic_suite,
                'flat_floor': item.flat_floor,
                'lving_zone_count': item.lving_zone_count,
                'initial_crew_training_days': item.initial_crew_training_days,
                'recurrent_crew_training_days': item.recurrent_crew_training_days,
                'upgrade_crew_training_days': item.upgrade_crew_training_days,
                'estimated_hourly_charter': item.estimated_hourly_charter,
                'hourly_ownership_rate_NAmerica': item.hourly_ownership_rate_NAmerica,
                'profit_on_charter': item.profit_on_charter,
                'new_purchase': item.new_purchase,
                'average_pre_owned': item.average_pre_owned,
                'depreication_rate': item.depreication_rate,
                'annual_cost': item.annual_cost,
                'cabin_altitude_ceiling_meters': item.cabin_altitude_ceiling_meters,
                'altitude_sea_level_meters': item.altitude_sea_level_meters,
                'range_km': item.range_km,
                'max_altitude_feet': item.max_altitude_feet,
                'max_altitude_meters': item.max_altitude_meters,
                'high_speed_cruise_kmh': item.high_speed_cruise_kmh,
                'long_range_cruise_kmh': item.long_range_cruise_kmh,
                'ceiling_meters': item.ceiling_meters,
                'TO_distance_meters': item.TO_distance_meters,
                'landing_distance_meters': item.landing_distance_meters,
                'rate_climb_meters': item.rate_climb_meters,
                'initial_cruise_altitude_meters': item.initial_cruise_altitude_meters,
                'ext_length_meters': item.ext_length_meters,
                'wingspan_meters': item.wingspan_meters,
                'ext_height_meters': item.ext_height_meters,
                'hangar_space_square_meters': item.hangar_space_square_meters,
                'int_length_meters': item.int_length_meters,
                'int_width_meters': item.int_width_meters,
                'int_height_meters': item.int_height_meters,
                'cabin_volume_cubicmeters': item.cabin_volume_cubicmeters,
                'door_width_meters': item.door_width_meters,
                'door_height_meters': item.door_height_meters,
                'MTOW_kgs': item.MTOW_kgs,
                'max_ramp_weight_kgs': item.max_ramp_weight_kgs,
                'max_landing_weight_kgs': item.max_landing_weight_kgs,
                'max_payload_kgs': item.max_payload_kgs,
                'available_fuel_kgs': item.available_fuel_kgs,
                'useful_payloads_kgs': item.useful_payloads_kgs,
                'basic_operating_weight_kgs': item.basic_operating_weight_kgs,
                'baggage_capacity_cubicmeters': item.baggage_capacity_cubicmeters,
                'internal_baggage_cubicmeters': item.internal_baggage_cubicmeters,
                'external_baggage_cubicmeters': item.external_baggage_cubicmeters,
                'baggage_weight_kgs': item.baggage_weight_kgs,
                'thrust_output_kgs': item.thrust_output_kgs,
                'total_thrust_kgs': item.total_thrust_kgs,
                'hourly_fuel_burn_LPH': item.hourly_fuel_burn_LPH,
                'average_mission_length': item.average_mission_length,
                'floorplan_drawing': item.floorplan_drawing,
                'image_name': item.aircraft_image,

                'NA_annual_captain': item.NA_annual_captain,
                'NA_annual_first_office': item.NA_annual_first_office,
                'NA_annual_employee_benefits': item.NA_annual_employee_benefits,
                'NA_annual_crew_training': item.NA_annual_crew_training,
                'NA_annual_hangar': item.NA_annual_hangar,
                'NA_annual_insurance_hull': item.NA_annual_insurance_hull,
                'NA_annual_insurance_liability': item.NA_annual_insurance_liability,
                'NA_annual_management': item.NA_annual_management,
                'NA_annual_misc': item.NA_annual_misc,
                'NA_annual_deprecation': item.NA_annual_deprecation,
                'NA_annual_total': item.NA_annual_total,
                'EU_annual_captain': item.EU_annual_captain,
                'EU_annual_first_office': item.EU_annual_first_office,
                'EU_annual_employee_benefits': item.EU_annual_employee_benefits,
                'EU_annual_crew_training': item.EU_annual_crew_training,
                'EU_annual_hangar': item.EU_annual_hangar,
                'EU_annual_insurance_hull': item.EU_annual_insurance_hull,
                'EU_annual_insurance_liability': item.EU_annual_insurance_liability,
                'EU_annual_management': item.EU_annual_management,
                'EU_annual_misc': item.EU_annual_misc,
                'EU_annual_deprecation': item.EU_annual_deprecation,
                'EU_annual_total': item.EU_annual_total,
                'SA_annual_captain': item.SA_annual_captain,
                'SA_annual_first_office': item.SA_annual_first_office,
                'SA_annual_employee_benefits': item.SA_annual_employee_benefits,
                'SA_annual_crew_training': item.SA_annual_crew_training,
                'SA_annual_hangar': item.SA_annual_hangar,
                'SA_annual_insurance_hull': item.SA_annual_insurance_hull,
                'SA_annual_insurance_liability': item.SA_annual_insurance_liability,
                'SA_annual_management': item.SA_annual_management,
                'SA_annual_misc': item.SA_annual_misc,
                'SA_annual_deprecation': item.SA_annual_deprecation,
                'SA_annual_total': item.SA_annual_total,
                'AS_annual_captain': item.AS_annual_captain,
                'AS_annual_first_office': item.AS_annual_first_office,
                'AS_annual_employee_benefits': item.AS_annual_employee_benefits,
                'AS_annual_crew_training': item.AS_annual_crew_training,
                'AS_annual_hangar': item.AS_annual_hangar,
                'AS_annual_insurance_hull': item.AS_annual_insurance_hull,
                'AS_annual_insurance_liability': item.AS_annual_insurance_liability,
                'AS_annual_management': item.AS_annual_management,
                'AS_annual_misc': item.AS_annual_misc,
                'AS_annual_deprecation': item.AS_annual_deprecation,
                'AS_annual_total': item.AS_annual_total,
                'NA_hourly_fuel': item.NA_hourly_fuel,
                'NA_hourly_maintenance': item.NA_hourly_maintenance,
                'NA_hourly_engine_overhaul': item.NA_hourly_engine_overhaul,
                'NA_hourly_ground_fees': item.NA_hourly_ground_fees,
                'NA_hourly_misc': item.NA_hourly_misc,
                'NA_hourly_total': item.NA_hourly_total,
                'EU_hourly_fuel': item.EU_hourly_fuel,
                'EU_hourly_maintenance': item.EU_hourly_maintenance,
                'EU_hourly_engine_overhaul': item.EU_hourly_engine_overhaul,
                'EU_hourly_ground_fees': item.EU_hourly_ground_fees,
                'EU_hourly_misc': item.EU_hourly_misc,
                'EU_hourly_total': item.EU_hourly_total,
                'SA_hourly_fuel': item.SA_hourly_fuel,
                'SA_hourly_maintenance': item.SA_hourly_maintenance,
                'SA_hourly_engine_overhaul': item.SA_hourly_engine_overhaul,
                'SA_hourly_ground_fees': item.SA_hourly_ground_fees,
                'SA_hourly_misc': item.SA_hourly_misc,
                'SA_hourly_total': item.SA_hourly_total,
                'AS_hourly_fuel': item.AS_hourly_fuel,
                'AS_hourly_maintenance': item.AS_hourly_maintenance,
                'AS_hourly_engine_overhaul': item.AS_hourly_engine_overhaul,
                'AS_hourly_ground_fees': item.AS_hourly_ground_fees,
                'AS_hourly_misc': item.AS_hourly_misc,
                'AS_hourly_total': item.AS_hourly_total,
                'NA_fuel_costs': item.NA_fuel_costs,
                'EU_fuel_costs': item.EU_fuel_costs,
                'SA_fuel_costs': item.SA_fuel_costs,
                'AS_fuel_costs': item.AS_fuel_costs,
                'acquisition_values': item.acquisition_values,
                'historical_data': item.historical_data,
            })

        data = {
            'aircrafts': aircrafts_data,
            'count': aircrafts_number,
        }

        return JsonResponse(data)

@method_decorator(csrf_exempt, name="dispatch")
class AircraftSearch(View):
    def get(self, request):
        # request_data = request.GET if request.GET.get("aircraft_name") else request.data
        print(request)
        aircraft_name = request.GET.get("aircraft_name")
        print(aircraft_name);
        category = request.GET.get("category")
        aircraft_manufacturer = request.GET.get("aircraft_manufacturer")
        in_production = request.GET.get("in_production")
        max_pax = request.GET.get("max_pax")
        max_pax_min = request.GET.get("max_pax_min")
        range_NM_min = request.GET.get("range_NM_min")
        range_NM = request.GET.get("range_NM")
        high_cruise_knots_min = request.GET.get("high_cruise_knots_min")
        high_cruise_knots = request.GET.get("high_cruise_knots")
        max_altitude_feet_min = request.GET.get("max_altitude_feet_min")
        max_altitude_feet = request.GET.get("max_altitude_feet")
        hourly_fuel_burn_GPH_min = request.GET.get("hourly_fuel_burn_GPH_min")
        hourly_fuel_burn_GPH = request.GET.get("hourly_fuel_burn_GPH")
        baggage_capacity_CF_min = request.GET.get("baggage_capacity_CF_min")
        baggage_capacity_CF = request.GET.get("baggage_capacity_CF")
        TO_distance_feet_min = request.GET.get("TO_distance_feet_min")
        TO_distance_feet = request.GET.get("TO_distance_feet")
        landing_distance_feet_min = request.GET.get(
            "landing_distance_feet_min")
        landing_distance_feet = request.GET.get("landing_distance_feet")
        annual_cost_min = request.GET.get("annual_cost_min")
        annual_cost = request.GET.get("annual_cost")
        estimated_hourly_charter_min = request.GET.get(
            "estimated_hourly_charter_min")
        estimated_hourly_charter = request.GET.get("estimated_hourly_charter")
        new_purchase_min = request.GET.get("new_purchase_min")
        new_purchase = request.GET.get("new_purchase")
        average_pre_owned_min = request.GET.get("average_pre_owned_min")
        average_pre_owned = request.GET.get("average_pre_owned")
        try:
            results = Aircraft.objects.filter(Q
              (aircraft_name__icontains=aircraft_name, category__icontains=category, aircraft_manufacturer__icontains=aircraft_manufacturer, in_production__icontains=in_production, ) & Q(max_pax__lte=max_pax) & Q(max_pax__gte=max_pax_min) & Q(range_NM__gte=range_NM_min) & Q(range_NM__lte=range_NM) & Q(high_cruise_knots__lte=high_cruise_knots) & Q(high_cruise_knots__gte=high_cruise_knots_min) & Q(max_altitude_feet__lte=max_altitude_feet) & Q(max_altitude_feet__gte=max_altitude_feet_min) & Q(hourly_fuel_burn_GPH__lte=hourly_fuel_burn_GPH) & Q(hourly_fuel_burn_GPH__gte=hourly_fuel_burn_GPH_min) & Q(baggage_capacity_CF__lte=baggage_capacity_CF) & Q(baggage_capacity_CF__gte=baggage_capacity_CF_min) & Q(TO_distance_feet__lte=TO_distance_feet) & Q(TO_distance_feet__gte=TO_distance_feet_min) & Q(landing_distance_feet__lte=landing_distance_feet) & Q(landing_distance_feet__gte=landing_distance_feet_min) & Q(annual_cost__lte=annual_cost) & Q(annual_cost__gte=annual_cost_min) & Q(estimated_hourly_charter__lte=estimated_hourly_charter) & Q(estimated_hourly_charter__gte=estimated_hourly_charter_min) & Q(new_purchase__lte=new_purchase) & Q(new_purchase__gte=new_purchase_min) & Q(average_pre_owned__lte=average_pre_owned) & Q(average_pre_owned__gte=average_pre_owned_min))
        except Exception:
            print("ERROR: Failed to get object from database")
            return HttpResponse("Object not found !")
        else:
            data = []
            for item in results:
                data.append(
                    {
                        "aircraft_id": item.id,
                        "aircraft_name": item.aircraft_name,
                        "key_facts": item.key_facts,
                        "model": item.model,
                        "category": item.category,
                        "fleet_flight_link": item.fleet_flight_link,
                        'aircraft_manufacturer': item.aircraft_manufacturer,
                        "a_check": item.a_check,
                        "b_check": item.b_check,
                        "c_check": item.c_check,
                        "d_check": item.d_check,
                        "living_zones": item.living_zones,
                        "baggage_access": item.baggage_access,
                        "pressure_differential_psi": item.pressure_differential_psi,
                        "max_pax": item.max_pax,
                        "typical_pax": item.typical_pax,
                        "cabin_noise": item.cabin_noise,
                        "cabin_altitude": item.cabin_altitude,
                        "cabin_pressure": item.cabin_pressure,
                        "sea_level_cabin": item.sea_level_cabin,
                        "range_NM": item.range_NM,
                        "range_Miles": item.range_Miles,
                        "range_decrease_per_passenger": item.range_decrease_per_passenger,
                        "seat_full_range_NM": item.seat_full_range_NM,
                        "ferr_range_NM": item.ferr_range_NM,
                        "high_cruise_MPH": item.high_cruise_MPH,
                        "high_cruise_Mach": item.high_cruise_Mach,
                        "high_cruise_knots": item.high_cruise_knots,
                        "long_range_cruise_knots": item.long_range_cruise_knots,
                        "long_range_cruise_MPH": item.long_range_cruise_MPH,
                        "long_range_cruise_Mach": item.long_range_cruise_Mach,
                        "ceiling_feet": item.ceiling_feet,
                        "TO_distance_feet": item.TO_distance_feet,
                        "landing_distance_feet": item.landing_distance_feet,
                        "rate_climb": item.rate_climb,
                        "initial_cruise_altitude": item.initial_cruise_altitude,
                        "ext_length_feet": item.ext_length_feet,
                        "wingspan_feet": item.wingspan_feet,
                        "exterior_height_feet": item.exterior_height_feet,
                        "hangar_space_SF": item.hangar_space_SF,
                        "int_length_feet": item.int_length_feet,
                        "int_width_feet": item.int_width_feet,
                        "int_height_feet": item.int_height_feet,
                        "cabin_volume_CF": item.cabin_volume_CF,
                        "ratio": item.ratio,
                        'max_altitude_feet': item.max_altitude_feet,
                        'max_altitude_meters': item.max_altitude_meters,
                        "door_width_feet": item.door_width_feet,
                        "door_height_feet": item.door_height_feet,
                        "MTOW_lbs": item.MTOW_lbs,
                        "max_ramp_weight_lbs": item.max_ramp_weight_lbs,
                        "max_landing_weight_lbs": item.max_landing_weight_lbs,
                        "max_payload_lbs": item.max_payload_lbs,
                        "available_fuel_lbs": item.available_fuel_lbs,
                        "useful_load_lbs": item.useful_load_lbs,
                        "basic_operating_weight_lbs": item.basic_operating_weight_lbs,
                        "baggage_capacity_CF": item.baggage_capacity_CF,
                        "internal_baggage_CF": item.internal_baggage_CF,
                        "external_baggage_CF": item.external_baggage_CF,
                        "baggage_weight_lbs": item.baggage_weight_lbs,
                        "engine_manufacturer": item.engine_manufacturer,
                        "engine_model": item.engine_model,
                        'minimum_pilots': item.minimum_pilots,
                        "thrust_output_lbs": item.thrust_output_lbs,
                        "total_thrust_lbs": item.total_thrust_lbs,
                        "hourly_fuel_burn_GPH": item.hourly_fuel_burn_GPH,
                        "lateral_db": item.lateral_db,
                        "flyover_db": item.flyover_db,
                        "approach_db": item.approach_db,
                        "production_start": item.production_start,
                        "production_end": item.production_end,
                        "in_production": item.in_production,
                        "number_made": item.number_made,
                        "number_in_service": item.number_in_service,
                        "serial_numbers": item.serial_numbers,
                        "dispatch_reliability": item.dispatch_reliability,
                        "single_pilot_certified": item.single_pilot_certified,
                        "toilet": item.toilet,
                        "shower": item.shower,
                        "space_to_sleep": item.space_to_sleep,
                        "dedicated_bed": item.dedicated_bed,
                        "typical_avionic_suite": item.typical_avionic_suite,
                        "flat_floor": item.flat_floor,
                        "lving_zone_count": item.lving_zone_count,
                        "initial_crew_training_days": item.initial_crew_training_days,
                        "recurrent_crew_training_days": item.recurrent_crew_training_days,
                        "upgrade_crew_training_days": item.upgrade_crew_training_days,
                        "estimated_hourly_charter": item.estimated_hourly_charter,
                        "hourly_ownership_rate_NAmerica": item.hourly_ownership_rate_NAmerica,
                        "profit_on_charter": item.profit_on_charter,
                        "new_purchase": item.new_purchase,
                        "average_pre_owned": item.average_pre_owned,
                        "depreication_rate": item.depreication_rate,
                        "annual_cost": item.annual_cost,
                        "cabin_altitude_ceiling_meters": item.cabin_altitude_ceiling_meters,
                        "altitude_sea_level_meters": item.altitude_sea_level_meters,
                        "range_km": item.range_km,
                        "high_speed_cruise_kmh": item.high_speed_cruise_kmh,
                        "long_range_cruise_kmh": item.long_range_cruise_kmh,
                        "ceiling_meters": item.ceiling_meters,
                        "TO_distance_meters": item.TO_distance_meters,
                        "landing_distance_meters": item.landing_distance_meters,
                        "rate_climb_meters": item.rate_climb_meters,
                        "initial_cruise_altitude_meters": item.initial_cruise_altitude_meters,
                        "ext_length_meters": item.ext_length_meters,
                        "wingspan_meters": item.wingspan_meters,
                        "ext_height_meters": item.ext_height_meters,
                        "hangar_space_square_meters": item.hangar_space_square_meters,
                        "int_length_meters": item.int_length_meters,
                        "int_width_meters": item.int_width_meters,
                        "int_height_meters": item.int_height_meters,
                        "cabin_volume_cubicmeters": item.cabin_volume_cubicmeters,
                        "door_width_meters": item.door_width_meters,
                        "door_height_meters": item.door_height_meters,
                        "MTOW_kgs": item.MTOW_kgs,
                        "max_ramp_weight_kgs": item.max_ramp_weight_kgs,
                        "max_landing_weight_kgs": item.max_landing_weight_kgs,
                        "max_payload_kgs": item.max_payload_kgs,
                        "available_fuel_kgs": item.available_fuel_kgs,
                        "useful_payloads_kgs": item.useful_payloads_kgs,
                        "basic_operating_weight_kgs": item.basic_operating_weight_kgs,
                        "baggage_capacity_cubicmeters": item.baggage_capacity_cubicmeters,
                        "internal_baggage_cubicmeters": item.internal_baggage_cubicmeters,
                        "external_baggage_cubicmeters": item.external_baggage_cubicmeters,
                        "baggage_weight_kgs": item.baggage_weight_kgs,
                        "thrust_output_kgs": item.thrust_output_kgs,
                        "total_thrust_kgs": item.total_thrust_kgs,
                        "hourly_fuel_burn_LPH": item.hourly_fuel_burn_LPH,
                        "average_mission_length": item.average_mission_length,
                        'floorplan_drawing': item.floorplan_drawing,
                        "image_name": item.aircraft_image,
                        'NA_annual_captain': item.NA_annual_captain,
                        'NA_annual_first_office': item.NA_annual_first_office,
                        'NA_annual_employee_benefits': item.NA_annual_employee_benefits,
                        'NA_annual_crew_training': item.NA_annual_crew_training,
                        'NA_annual_hangar': item.NA_annual_hangar,
                        'NA_annual_insurance_hull': item.NA_annual_insurance_hull,
                        'NA_annual_insurance_liability': item.NA_annual_insurance_liability,
                        'NA_annual_management': item.NA_annual_management,
                        'NA_annual_misc': item.NA_annual_misc,
                        'NA_annual_deprecation': item.NA_annual_deprecation,
                        'NA_annual_total': item.NA_annual_total,
                        'EU_annual_captain': item.EU_annual_captain,
                        'EU_annual_first_office': item.EU_annual_first_office,
                        'EU_annual_employee_benefits': item.EU_annual_employee_benefits,
                        'EU_annual_crew_training': item.EU_annual_crew_training,
                        'EU_annual_hangar': item.EU_annual_hangar,
                        'EU_annual_insurance_hull': item.EU_annual_insurance_hull,
                        'EU_annual_insurance_liability': item.EU_annual_insurance_liability,
                        'EU_annual_management': item.EU_annual_management,
                        'EU_annual_misc': item.EU_annual_misc,
                        'EU_annual_deprecation': item.EU_annual_deprecation,
                        'EU_annual_total': item.EU_annual_total,
                        'SA_annual_captain': item.SA_annual_captain,
                        'SA_annual_first_office': item.SA_annual_first_office,
                        'SA_annual_employee_benefits': item.SA_annual_employee_benefits,
                        'SA_annual_crew_training': item.SA_annual_crew_training,
                        'SA_annual_hangar': item.SA_annual_hangar,
                        'SA_annual_insurance_hull': item.SA_annual_insurance_hull,
                        'SA_annual_insurance_liability': item.SA_annual_insurance_liability,
                        'SA_annual_management': item.SA_annual_management,
                        'SA_annual_misc': item.SA_annual_misc,
                        'SA_annual_deprecation': item.SA_annual_deprecation,
                        'SA_annual_total': item.SA_annual_total,
                        'AS_annual_captain': item.AS_annual_captain,
                        'AS_annual_first_office': item.AS_annual_first_office,
                        'AS_annual_employee_benefits': item.AS_annual_employee_benefits,
                        'AS_annual_crew_training': item.AS_annual_crew_training,
                        'AS_annual_hangar': item.AS_annual_hangar,
                        'AS_annual_insurance_hull': item.AS_annual_insurance_hull,
                        'AS_annual_insurance_liability': item.AS_annual_insurance_liability,
                        'AS_annual_management': item.AS_annual_management,
                        'AS_annual_misc': item.AS_annual_misc,
                        'AS_annual_deprecation': item.AS_annual_deprecation,
                        'AS_annual_total': item.AS_annual_total,
                        'NA_fuel_costs': item.NA_fuel_costs,
                        'EU_fuel_costs': item.EU_fuel_costs,
                        'SA_fuel_costs': item.SA_fuel_costs,
                        'AS_fuel_costs': item.AS_fuel_costs,
                        'NA_hourly_fuel': item.NA_hourly_fuel,
                        'NA_hourly_maintenance': item.NA_hourly_maintenance,
                        'NA_hourly_engine_overhaul': item.NA_hourly_engine_overhaul,
                        'NA_hourly_ground_fees': item.NA_hourly_ground_fees,
                        'NA_hourly_misc': item.NA_hourly_misc,
                        'NA_hourly_total': item.NA_hourly_total,
                        'EU_hourly_fuel': item.EU_hourly_fuel,
                        'EU_hourly_maintenance': item.EU_hourly_maintenance,
                        'EU_hourly_engine_overhaul': item.EU_hourly_engine_overhaul,
                        'EU_hourly_ground_fees': item.EU_hourly_ground_fees,
                        'EU_hourly_misc': item.EU_hourly_misc,
                        'EU_hourly_total': item.EU_hourly_total,
                        'SA_hourly_fuel': item.SA_hourly_fuel,
                        'SA_hourly_maintenance': item.SA_hourly_maintenance,
                        'SA_hourly_engine_overhaul': item.SA_hourly_engine_overhaul,
                        'SA_hourly_ground_fees': item.SA_hourly_ground_fees,
                        'SA_hourly_misc': item.SA_hourly_misc,
                        'SA_hourly_total': item.SA_hourly_total,
                        'AS_hourly_fuel': item.AS_hourly_fuel,
                        'AS_hourly_maintenance': item.AS_hourly_maintenance,
                        'AS_hourly_engine_overhaul': item.AS_hourly_engine_overhaul,
                        'AS_hourly_ground_fees': item.AS_hourly_ground_fees,
                        'AS_hourly_misc': item.AS_hourly_misc,
                        'AS_hourly_total': item.AS_hourly_total,
                        'acquisition_values': item.acquisition_values,
                        'historical_data': item.historical_data,
                    }
                )

        searchdata = {
            'aircrafts': data,
        }

        return JsonResponse(searchdata)

@method_decorator(csrf_exempt, name='dispatch')
class AircraftById(View):
    def get(self, request, id):
        item = Aircraft.objects.get(id=id)
        aircraft_data = []
        aircraft_data.append({
            'aircraft_id': item.id,
            'aircraft_name': item.aircraft_name,
            'fleet_flight_link': item.fleet_flight_link,
            "a_check": item.a_check,
            "b_check": item.b_check,
            "c_check": item.c_check,
            "d_check": item.d_check,
            "living_zones": item.living_zones,
            "baggage_access": item.baggage_access,
            "pressure_differential_psi": item.pressure_differential_psi,
            'key_facts': item.key_facts,
            'model': item.model,
            'category': item.category,
            'aircraft_manufacturer': item.aircraft_manufacturer,
            'max_pax': item.max_pax,
            'typical_pax': item.typical_pax,
            'cabin_noise': item.cabin_noise,
            'cabin_altitude': item.cabin_altitude,
            'cabin_pressure': item.cabin_pressure,
            'sea_level_cabin': item.sea_level_cabin,
            'range_NM': item.range_NM,
            'range_Miles': item.range_Miles,
            'range_decrease_per_passenger': item.range_decrease_per_passenger,
            'seat_full_range_NM': item.seat_full_range_NM,
            'ferr_range_NM': item.ferr_range_NM,
            'high_cruise_MPH': item.high_cruise_MPH,
            'high_cruise_Mach': item.high_cruise_Mach,
            'long_range_cruise_knots': item.long_range_cruise_knots,
            'long_range_cruise_MPH': item.long_range_cruise_MPH,
            'long_range_cruise_Mach': item.long_range_cruise_Mach,
            'max_altitude_feet': item.max_altitude_feet,
            'max_altitude_meters': item.max_altitude_meters,
            'ceiling_feet': item.ceiling_feet,
            'minimum_pilots': item.minimum_pilots,
            'TO_distance_feet': item.TO_distance_feet,
            'landing_distance_feet': item.landing_distance_feet,
            'rate_climb': item.rate_climb,
            'initial_cruise_altitude': item.initial_cruise_altitude,
            'ext_length_feet': item.ext_length_feet,
            'wingspan_feet': item.wingspan_feet,
            'exterior_height_feet': item.exterior_height_feet,
            'hangar_space_SF': item.hangar_space_SF,
            'int_length_feet': item.int_length_feet,
            'int_width_feet': item.int_width_feet,
            'int_height_feet': item.int_height_feet,
            'cabin_volume_CF': item.cabin_volume_CF,
            'ratio': item.ratio,
            'door_width_feet': item.door_width_feet,
            'door_height_feet': item.door_height_feet,
            'MTOW_lbs': item.MTOW_lbs,
            'max_ramp_weight_lbs': item.max_ramp_weight_lbs,
            'max_landing_weight_lbs': item.max_landing_weight_lbs,
            'max_payload_lbs': item.max_payload_lbs,
            'available_fuel_lbs': item.available_fuel_lbs,
            'useful_load_lbs': item.useful_load_lbs,
            'basic_operating_weight_lbs': item.basic_operating_weight_lbs,
            'baggage_capacity_CF': item.baggage_capacity_CF,
            'internal_baggage_CF': item.internal_baggage_CF,
            'external_baggage_CF': item.external_baggage_CF,
            'baggage_weight_lbs': item.baggage_weight_lbs,
            'engine_manufacturer': item.engine_manufacturer,
            'engine_model': item.engine_model,
            'thrust_output_lbs': item.thrust_output_lbs,
            'total_thrust_lbs': item.total_thrust_lbs,
            'hourly_fuel_burn_GPH': item.hourly_fuel_burn_GPH,
            'lateral_db': item.lateral_db,
            'flyover_db': item.flyover_db,
            'approach_db': item.approach_db,
            'production_start': item.production_start,
            'production_end': item.production_end,
            'in_production': item.in_production,
            'number_made': item.number_made,
            'number_in_service': item.number_in_service,

            'serial_numbers': item.serial_numbers,
            'dispatch_reliability': item.dispatch_reliability,
            'single_pilot_certified': item.single_pilot_certified,
            'toilet': item.toilet,
            'shower': item.shower,
            'space_to_sleep': item.space_to_sleep,
            'dedicated_bed': item.dedicated_bed,
            'typical_avionic_suite': item.typical_avionic_suite,
            'flat_floor': item.flat_floor,
            'lving_zone_count': item.lving_zone_count,
            'initial_crew_training_days': item.initial_crew_training_days,
            'recurrent_crew_training_days': item.recurrent_crew_training_days,
            'upgrade_crew_training_days': item.upgrade_crew_training_days,
            'estimated_hourly_charter': item.estimated_hourly_charter,
            'hourly_ownership_rate_NAmerica': item.hourly_ownership_rate_NAmerica,
            'profit_on_charter': item.profit_on_charter,
            'new_purchase': item.new_purchase,
            'average_pre_owned': item.average_pre_owned,
            'depreication_rate': item.depreication_rate,
            'annual_cost': item.annual_cost,
            'cabin_altitude_ceiling_meters': item.cabin_altitude_ceiling_meters,
            'altitude_sea_level_meters': item.altitude_sea_level_meters,
            'range_km': item.range_km,
            'high_speed_cruise_kmh': item.high_speed_cruise_kmh,
            'long_range_cruise_kmh': item.long_range_cruise_kmh,
            'ceiling_meters': item.ceiling_meters,
            'TO_distance_meters': item.TO_distance_meters,
            'landing_distance_meters': item.landing_distance_meters,
            'rate_climb_meters': item.rate_climb_meters,
            'initial_cruise_altitude_meters': item.initial_cruise_altitude_meters,
            'ext_length_meters': item.ext_length_meters,
            'wingspan_meters': item.wingspan_meters,
            'ext_height_meters': item.ext_height_meters,
            'hangar_space_square_meters': item.hangar_space_square_meters,
            'int_length_meters': item.int_length_meters,
            'int_width_meters': item.int_width_meters,
            'int_height_meters': item.int_height_meters,
            'cabin_volume_cubicmeters': item.cabin_volume_cubicmeters,
            'door_width_meters': item.door_width_meters,
            'door_height_meters': item.door_height_meters,
            'MTOW_kgs': item.MTOW_kgs,
            "high_cruise_knots": item.high_cruise_knots,
            'max_ramp_weight_kgs': item.max_ramp_weight_kgs,
            'max_landing_weight_kgs': item.max_landing_weight_kgs,
            'max_payload_kgs': item.max_payload_kgs,
            'available_fuel_kgs': item.available_fuel_kgs,
            'useful_payloads_kgs': item.useful_payloads_kgs,
            'basic_operating_weight_kgs': item.basic_operating_weight_kgs,
            'baggage_capacity_cubicmeters': item.baggage_capacity_cubicmeters,
            'internal_baggage_cubicmeters': item.internal_baggage_cubicmeters,
            'external_baggage_cubicmeters': item.external_baggage_cubicmeters,
            'baggage_weight_kgs': item.baggage_weight_kgs,
            'thrust_output_kgs': item.thrust_output_kgs,
            'total_thrust_kgs': item.total_thrust_kgs,
            'hourly_fuel_burn_LPH': item.hourly_fuel_burn_LPH,
            'average_mission_length': item.average_mission_length,
            'floorplan_drawing': item.floorplan_drawing,
            'image_name': item.aircraft_image,
            'NA_annual_captain': item.NA_annual_captain,
            'NA_annual_first_office': item.NA_annual_first_office,
            'NA_annual_employee_benefits': item.NA_annual_employee_benefits,
            'NA_annual_crew_training': item.NA_annual_crew_training,
            'NA_annual_hangar': item.NA_annual_hangar,
            'NA_annual_insurance_hull': item.NA_annual_insurance_hull,
            'NA_annual_insurance_liability': item.NA_annual_insurance_liability,
            'NA_annual_management': item.NA_annual_management,
            'NA_annual_misc': item.NA_annual_misc,
            'NA_annual_deprecation': item.NA_annual_deprecation,
            'NA_annual_total': item.NA_annual_total,
            'EU_annual_captain': item.EU_annual_captain,
            'EU_annual_first_office': item.EU_annual_first_office,
            'EU_annual_employee_benefits': item.EU_annual_employee_benefits,
            'EU_annual_crew_training': item.EU_annual_crew_training,
            'EU_annual_hangar': item.EU_annual_hangar,
            'EU_annual_insurance_hull': item.EU_annual_insurance_hull,
            'EU_annual_insurance_liability': item.EU_annual_insurance_liability,
            'EU_annual_management': item.EU_annual_management,
            'EU_annual_misc': item.EU_annual_misc,
            'EU_annual_deprecation': item.EU_annual_deprecation,
            'EU_annual_total': item.EU_annual_total,
            'SA_annual_captain': item.SA_annual_captain,
            'SA_annual_first_office': item.SA_annual_first_office,
            'SA_annual_employee_benefits': item.SA_annual_employee_benefits,
            'SA_annual_crew_training': item.SA_annual_crew_training,
            'SA_annual_hangar': item.SA_annual_hangar,
            'SA_annual_insurance_hull': item.SA_annual_insurance_hull,
            'SA_annual_insurance_liability': item.SA_annual_insurance_liability,
            'SA_annual_management': item.SA_annual_management,
            'SA_annual_misc': item.SA_annual_misc,
            'SA_annual_deprecation': item.SA_annual_deprecation,
            'SA_annual_total': item.SA_annual_total,
            'AS_annual_captain': item.AS_annual_captain,
            'AS_annual_first_office': item.AS_annual_first_office,
            'AS_annual_employee_benefits': item.AS_annual_employee_benefits,
            'AS_annual_crew_training': item.AS_annual_crew_training,
            'AS_annual_hangar': item.AS_annual_hangar,
            'AS_annual_insurance_hull': item.AS_annual_insurance_hull,
            'AS_annual_insurance_liability': item.AS_annual_insurance_liability,
            'AS_annual_management': item.AS_annual_management,
            'AS_annual_misc': item.AS_annual_misc,
            'AS_annual_deprecation': item.AS_annual_deprecation,
            'AS_annual_total': item.AS_annual_total,
            'NA_fuel_costs': item.NA_fuel_costs,
            'EU_fuel_costs': item.EU_fuel_costs,
            'SA_fuel_costs': item.SA_fuel_costs,
            'AS_fuel_costs': item.AS_fuel_costs,
            'NA_hourly_fuel': item.NA_hourly_fuel,
            'NA_hourly_maintenance': item.NA_hourly_maintenance,
            'NA_hourly_engine_overhaul': item.NA_hourly_engine_overhaul,
            'NA_hourly_ground_fees': item.NA_hourly_ground_fees,
            'NA_hourly_misc': item.NA_hourly_misc,
            'NA_hourly_total': item.NA_hourly_total,
            'EU_hourly_fuel': item.EU_hourly_fuel,
            'EU_hourly_maintenance': item.EU_hourly_maintenance,
            'EU_hourly_engine_overhaul': item.EU_hourly_engine_overhaul,
            'EU_hourly_ground_fees': item.EU_hourly_ground_fees,
            'EU_hourly_misc': item.EU_hourly_misc,
            'EU_hourly_total': item.EU_hourly_total,
            'SA_hourly_fuel': item.SA_hourly_fuel,
            'SA_hourly_maintenance': item.SA_hourly_maintenance,
            'SA_hourly_engine_overhaul': item.SA_hourly_engine_overhaul,
            'SA_hourly_ground_fees': item.SA_hourly_ground_fees,
            'SA_hourly_misc': item.SA_hourly_misc,
            'SA_hourly_total': item.SA_hourly_total,
            'AS_hourly_fuel': item.AS_hourly_fuel,
            'AS_hourly_maintenance': item.AS_hourly_maintenance,
            'AS_hourly_engine_overhaul': item.AS_hourly_engine_overhaul,
            'AS_hourly_ground_fees': item.AS_hourly_ground_fees,
            'AS_hourly_misc': item.AS_hourly_misc,
            'AS_hourly_total': item.AS_hourly_total,
            'acquisition_values':  item.acquisition_values,
            'historical_data': item.historical_data,

        })
        context = {'aircraft': aircraft_data}
        return JsonResponse(context)

@method_decorator(csrf_exempt, name='dispatch')
class AircraftByName(View):
  def get(self, request, name):
    item = Aircraft.objects.get(aircraft_name=name)
    aircraft_data = []
    aircraft_data.append({
      'aircraft_id': item.id,
      'aircraft_name': item.aircraft_name,
      'fleet_flight_link': item.fleet_flight_link,
      "a_check": item.a_check,
      "b_check": item.b_check,
      "c_check": item.c_check,
      "d_check": item.d_check,
      "living_zones": item.living_zones,
      "baggage_access": item.baggage_access,
      "pressure_differential_psi": item.pressure_differential_psi,
      'key_facts': item.key_facts,
      'model': item.model,
      'category': item.category,
      'aircraft_manufacturer': item.aircraft_manufacturer,
      'max_pax': item.max_pax,
      'typical_pax': item.typical_pax,
      'cabin_noise': item.cabin_noise,
      'cabin_altitude': item.cabin_altitude,
      'cabin_pressure': item.cabin_pressure,
      'sea_level_cabin': item.sea_level_cabin,
      'range_NM': item.range_NM,
      'range_Miles': item.range_Miles,
      'range_decrease_per_passenger': item.range_decrease_per_passenger,
      'seat_full_range_NM': item.seat_full_range_NM,
      'ferr_range_NM': item.ferr_range_NM,
      'high_cruise_MPH': item.high_cruise_MPH,
      'high_cruise_Mach': item.high_cruise_Mach,
      'long_range_cruise_knots': item.long_range_cruise_knots,
      'long_range_cruise_MPH': item.long_range_cruise_MPH,
      'long_range_cruise_Mach': item.long_range_cruise_Mach,
      'max_altitude_feet': item.max_altitude_feet,
      'max_altitude_meters': item.max_altitude_meters,
      'ceiling_feet': item.ceiling_feet,
      'minimum_pilots': item.minimum_pilots,
      'TO_distance_feet': item.TO_distance_feet,
      'landing_distance_feet': item.landing_distance_feet,
      'rate_climb': item.rate_climb,
      'initial_cruise_altitude': item.initial_cruise_altitude,
      'ext_length_feet': item.ext_length_feet,
      'wingspan_feet': item.wingspan_feet,
      'exterior_height_feet': item.exterior_height_feet,
      'hangar_space_SF': item.hangar_space_SF,
      'int_length_feet': item.int_length_feet,
      'int_width_feet': item.int_width_feet,
      'int_height_feet': item.int_height_feet,
      'cabin_volume_CF': item.cabin_volume_CF,
      'ratio': item.ratio,
      'door_width_feet': item.door_width_feet,
      'door_height_feet': item.door_height_feet,
      'MTOW_lbs': item.MTOW_lbs,
      'max_ramp_weight_lbs': item.max_ramp_weight_lbs,
      'max_landing_weight_lbs': item.max_landing_weight_lbs,
      'max_payload_lbs': item.max_payload_lbs,
      'available_fuel_lbs': item.available_fuel_lbs,
      'useful_load_lbs': item.useful_load_lbs,
      'basic_operating_weight_lbs': item.basic_operating_weight_lbs,
      'baggage_capacity_CF': item.baggage_capacity_CF,
      'internal_baggage_CF': item.internal_baggage_CF,
      'external_baggage_CF': item.external_baggage_CF,
      'baggage_weight_lbs': item.baggage_weight_lbs,
      'engine_manufacturer': item.engine_manufacturer,
      'engine_model': item.engine_model,
      'thrust_output_lbs': item.thrust_output_lbs,
      'total_thrust_lbs': item.total_thrust_lbs,
      'hourly_fuel_burn_GPH': item.hourly_fuel_burn_GPH,
      'lateral_db': item.lateral_db,
      'flyover_db': item.flyover_db,
      'approach_db': item.approach_db,
      'production_start': item.production_start,
      'production_end': item.production_end,
      'in_production': item.in_production,
      'number_made': item.number_made,
      'number_in_service': item.number_in_service,
      'serial_numbers': item.serial_numbers,
      'dispatch_reliability': item.dispatch_reliability,
      'single_pilot_certified': item.single_pilot_certified,
      'toilet': item.toilet,
      'shower': item.shower,
      'space_to_sleep': item.space_to_sleep,
      'dedicated_bed': item.dedicated_bed,
      'typical_avionic_suite': item.typical_avionic_suite,
      'flat_floor': item.flat_floor,
      'lving_zone_count': item.lving_zone_count,
      'initial_crew_training_days': item.initial_crew_training_days,
      'recurrent_crew_training_days': item.recurrent_crew_training_days,
      'upgrade_crew_training_days': item.upgrade_crew_training_days,
      'estimated_hourly_charter': item.estimated_hourly_charter,
      'hourly_ownership_rate_NAmerica': item.hourly_ownership_rate_NAmerica,
      'profit_on_charter': item.profit_on_charter,
      'new_purchase': item.new_purchase,
      'average_pre_owned': item.average_pre_owned,
      'depreication_rate': item.depreication_rate,
      'annual_cost': item.annual_cost,
      'cabin_altitude_ceiling_meters': item.cabin_altitude_ceiling_meters,
      'altitude_sea_level_meters': item.altitude_sea_level_meters,
      'range_km': item.range_km,
      'high_speed_cruise_kmh': item.high_speed_cruise_kmh,
      'long_range_cruise_kmh': item.long_range_cruise_kmh,
      'ceiling_meters': item.ceiling_meters,
      'TO_distance_meters': item.TO_distance_meters,
      'landing_distance_meters': item.landing_distance_meters,
      'rate_climb_meters': item.rate_climb_meters,
      'initial_cruise_altitude_meters': item.initial_cruise_altitude_meters,
      'ext_length_meters': item.ext_length_meters,
      'wingspan_meters': item.wingspan_meters,
      'ext_height_meters': item.ext_height_meters,
      'hangar_space_square_meters': item.hangar_space_square_meters,
      'int_length_meters': item.int_length_meters,
      'int_width_meters': item.int_width_meters,
      'int_height_meters': item.int_height_meters,
      'cabin_volume_cubicmeters': item.cabin_volume_cubicmeters,
      'door_width_meters': item.door_width_meters,
      'door_height_meters': item.door_height_meters,
      'MTOW_kgs': item.MTOW_kgs,
      "high_cruise_knots": item.high_cruise_knots,
      'max_ramp_weight_kgs': item.max_ramp_weight_kgs,
      'max_landing_weight_kgs': item.max_landing_weight_kgs,
      'max_payload_kgs': item.max_payload_kgs,
      'available_fuel_kgs': item.available_fuel_kgs,
      'useful_payloads_kgs': item.useful_payloads_kgs,
      'basic_operating_weight_kgs': item.basic_operating_weight_kgs,
      'baggage_capacity_cubicmeters': item.baggage_capacity_cubicmeters,
      'internal_baggage_cubicmeters': item.internal_baggage_cubicmeters,
      'external_baggage_cubicmeters': item.external_baggage_cubicmeters,
      'baggage_weight_kgs': item.baggage_weight_kgs,
      'thrust_output_kgs': item.thrust_output_kgs,
      'total_thrust_kgs': item.total_thrust_kgs,
      'hourly_fuel_burn_LPH': item.hourly_fuel_burn_LPH,
      'average_mission_length': item.average_mission_length,
      'floorplan_drawing': item.floorplan_drawing,
      'image_name': item.aircraft_image,
      'NA_annual_captain': item.NA_annual_captain,
      'NA_annual_first_office': item.NA_annual_first_office,
      'NA_annual_employee_benefits': item.NA_annual_employee_benefits,
      'NA_annual_crew_training': item.NA_annual_crew_training,
      'NA_annual_hangar': item.NA_annual_hangar,
      'NA_annual_insurance_hull': item.NA_annual_insurance_hull,
      'NA_annual_insurance_liability': item.NA_annual_insurance_liability,
      'NA_annual_management': item.NA_annual_management,
      'NA_annual_misc': item.NA_annual_misc,
      'NA_annual_deprecation': item.NA_annual_deprecation,
      'NA_annual_total': item.NA_annual_total,
      'EU_annual_captain': item.EU_annual_captain,
      'EU_annual_first_office': item.EU_annual_first_office,
      'EU_annual_employee_benefits': item.EU_annual_employee_benefits,
      'EU_annual_crew_training': item.EU_annual_crew_training,
      'EU_annual_hangar': item.EU_annual_hangar,
      'EU_annual_insurance_hull': item.EU_annual_insurance_hull,
      'EU_annual_insurance_liability': item.EU_annual_insurance_liability,
      'EU_annual_management': item.EU_annual_management,
      'EU_annual_misc': item.EU_annual_misc,
      'EU_annual_deprecation': item.EU_annual_deprecation,
      'EU_annual_total': item.EU_annual_total,
      'SA_annual_captain': item.SA_annual_captain,
      'SA_annual_first_office': item.SA_annual_first_office,
      'SA_annual_employee_benefits': item.SA_annual_employee_benefits,
      'SA_annual_crew_training': item.SA_annual_crew_training,
      'SA_annual_hangar': item.SA_annual_hangar,
      'SA_annual_insurance_hull': item.SA_annual_insurance_hull,
      'SA_annual_insurance_liability': item.SA_annual_insurance_liability,
      'SA_annual_management': item.SA_annual_management,
      'SA_annual_misc': item.SA_annual_misc,
      'SA_annual_deprecation': item.SA_annual_deprecation,
      'SA_annual_total': item.SA_annual_total,
      'AS_annual_captain': item.AS_annual_captain,
      'AS_annual_first_office': item.AS_annual_first_office,
      'AS_annual_employee_benefits': item.AS_annual_employee_benefits,
      'AS_annual_crew_training': item.AS_annual_crew_training,
      'AS_annual_hangar': item.AS_annual_hangar,
      'AS_annual_insurance_hull': item.AS_annual_insurance_hull,
      'AS_annual_insurance_liability': item.AS_annual_insurance_liability,
      'AS_annual_management': item.AS_annual_management,
      'AS_annual_misc': item.AS_annual_misc,
      'AS_annual_deprecation': item.AS_annual_deprecation,
      'AS_annual_total': item.AS_annual_total,
      'NA_fuel_costs': item.NA_fuel_costs,
      'EU_fuel_costs': item.EU_fuel_costs,
      'SA_fuel_costs': item.SA_fuel_costs,
      'AS_fuel_costs': item.AS_fuel_costs,
      'NA_hourly_fuel': item.NA_hourly_fuel,
      'NA_hourly_maintenance': item.NA_hourly_maintenance,
      'NA_hourly_engine_overhaul': item.NA_hourly_engine_overhaul,
      'NA_hourly_ground_fees': item.NA_hourly_ground_fees,
      'NA_hourly_misc': item.NA_hourly_misc,
      'NA_hourly_total': item.NA_hourly_total,
      'EU_hourly_fuel': item.EU_hourly_fuel,
      'EU_hourly_maintenance': item.EU_hourly_maintenance,
      'EU_hourly_engine_overhaul': item.EU_hourly_engine_overhaul,
      'EU_hourly_ground_fees': item.EU_hourly_ground_fees,
      'EU_hourly_misc': item.EU_hourly_misc,
      'EU_hourly_total': item.EU_hourly_total,
      'SA_hourly_fuel': item.SA_hourly_fuel,
      'SA_hourly_maintenance': item.SA_hourly_maintenance,
      'SA_hourly_engine_overhaul': item.SA_hourly_engine_overhaul,
      'SA_hourly_ground_fees': item.SA_hourly_ground_fees,
      'SA_hourly_misc': item.SA_hourly_misc,
      'SA_hourly_total': item.SA_hourly_total,
      'AS_hourly_fuel': item.AS_hourly_fuel,
      'AS_hourly_maintenance': item.AS_hourly_maintenance,
      'AS_hourly_engine_overhaul': item.AS_hourly_engine_overhaul,
      'AS_hourly_ground_fees': item.AS_hourly_ground_fees,
      'AS_hourly_misc': item.AS_hourly_misc,
      'AS_hourly_total': item.AS_hourly_total,
      'acquisition_values':  item.acquisition_values,
      'historical_data': item.historical_data,
    })
    context = {'aircraft': aircraft_data}
    return JsonResponse(context)

@method_decorator(csrf_exempt, name='dispatch')
class AccidentsList(View):
    def get(self, request):
        accidents_number = Accident.objects.count()
        all_accidents = Accident.objects.all()
        accidents_data = []
        for item in all_accidents:
            accidents_data.append({
                'country': item.country,
                'aircraft_incident': item.aircraft_incident.aircraft_name,
                'reg': item.reg,
                'date': item.date,
                'occurrence': item.occurrence,
                'details': item.details,
            })

        data = {
            'accidents': accidents_data,
            'count': accidents_number,
        }

        return JsonResponse(data)


def upload_csv(request):
    aircrafts = Aircraft.objects.all()
    prompt = {
        'order': 'Order of the CSV should be field1, field2, field3 ...',
        'products': aircrafts
    }
    if request.method == 'GET':
        return render(request, 'admin/upload-csv.html', prompt)
    csv_file = request.FILES['file']
    data_set = csv_file.read().decode('utf-8')
    io_string = io.StringIO(data_set)
    next(io_string)
    for column in csv.reader(io_string, delimiter=',', quotechar='|'):
        aircraft, created = Aircraft.objects.update_or_create(
            aircraft_name=column[0],
            model=column[1],
            aircraft_manufacturer=column[2],
            category=column[3],
            max_pax=float(column[4]),
            typical_pax=float(column[5]),
            cabin_noise=float(column[6]),
            cabin_altitude=float(column[7]),
            cabin_pressure=float(column[8]),
            pressure_differential_psi=float(column[9]),
            sea_level_cabin=float(column[10]),
            range_NM=float(column[11]),
            range_Miles=float(column[12]),
            range_decrease_per_passenger=float(column[13]),
            seat_full_range_NM=float(column[14]),
            ferr_range_NM=float(column[15]),
            high_cruise_MPH=float(column[16]),
            high_cruise_Mach=float(column[17]),
            high_cruise_knots=float(column[18]),
            long_range_cruise_knots=float(column[19]),
            long_range_cruise_MPH=float(column[20]),
            long_range_cruise_Mach=float(column[21]),
            ceiling_feet=float(column[22]),
            TO_distance_feet=float(column[23]),
            landing_distance_feet=float(column[24]),
            rate_climb=float(column[25]),
            initial_cruise_altitude=float(column[26]),
            ext_length_feet=float(column[27]),
            wingspan_feet=float(column[28]),
            exterior_height_feet=float(column[29]),
            hangar_space_SF=float(column[30]),
            int_length_feet=float(column[31]),
            int_width_feet=float(column[32]),
            int_height_feet=float(column[33]),
            cabin_volume_CF=float(column[34]),
            ratio=float(column[35]),
            door_width_feet=float(column[36]),
            door_height_feet=float(column[37]),
            MTOW_lbs=float(column[38]),
            max_ramp_weight_lbs=float(column[39]),
            max_landing_weight_lbs=float(column[40]),
            max_payload_lbs=float(column[41]),
            available_fuel_lbs=float(column[42]),
            useful_load_lbs=float(column[43]),
            basic_operating_weight_lbs=float(column[44]),
            baggage_capacity_CF=float(column[45]),
            internal_baggage_CF=float(column[46]),
            external_baggage_CF=float(column[47]),
            baggage_weight_lbs=float(column[48]),
            a_check=column[49],
            b_check=column[50],
            c_check=column[51],
            d_check=column[52],
            living_zones=float(column[53]),
            engine_manufacturer=column[54],
            engine_model=column[55],
            thrust_output_lbs=float(column[56]),
            total_thrust_lbs=float(column[57]),
            hourly_fuel_burn_GPH=float(column[58]),
            lateral_db=float(column[59]),
            flyover_db=float(column[60]),
            approach_db=float(column[61]),
            production_start=column[62],
            production_end=column[63],
            in_production=bool(column[64]),
            number_made=float(column[65]),
            number_in_service=float(column[66]),
            minimum_pilots=float(column[67]),
            serial_numbers=float(column[68]),
            dispatch_reliability=float(column[69]),
            single_pilot_certified=bool(column[70]),
            toilet=bool(column[71]),
            shower=bool(column[72]),
            baggage_access=bool(column[73]),
            space_to_sleep=bool(column[74]),
            dedicated_bed=bool(column[75]),
            typical_avionic_suite=column[76],
            flat_floor=bool(column[77]),
            lving_zone_count=float(column[78]),
            initial_crew_training_days=float(column[79]),
            recurrent_crew_training_days=float(column[80]),
            upgrade_crew_training_days=float(column[81]),
            estimated_hourly_charter=float(column[82]),
            hourly_ownership_rate_NAmerica=float(column[83]),
            profit_on_charter=float(column[84]),
            new_purchase=float(column[85]),
            average_pre_owned=float(column[86]),
            depreication_rate=float(column[87]),
            annual_cost=float(column[88]),
            cabin_altitude_ceiling_meters=float(column[89]),
            altitude_sea_level_meters=float(column[90]),
            range_km=float(column[91]),
            high_speed_cruise_kmh=float(column[92]),
            long_range_cruise_kmh=float(column[93]),
            ceiling_meters=float(column[94]),
            TO_distance_meters=float(column[95]),
            landing_distance_meters=float(column[96]),
            rate_climb_meters=float(column[97]),
            initial_cruise_altitude_meters=float(column[98]),
            ext_length_meters=float(column[99]),
            wingspan_meters=float(column[100]),
            ext_height_meters=float(column[101]),
            hangar_space_square_meters=float(column[102]),
            int_length_meters=float(column[103]),
            int_width_meters=float(column[104]),
            int_height_meters=float(column[105]),
            cabin_volume_cubicmeters=float(column[106]),
            door_width_meters=float(column[107]),
            door_height_meters=float(column[108]),
            MTOW_kgs=float(column[109]),
            max_ramp_weight_kgs=float(column[110]),
            max_landing_weight_kgs=float(column[111]),
            max_payload_kgs=float(column[112]),
            available_fuel_kgs=float(column[113]),
            useful_payloads_kgs=float(column[114]),
            basic_operating_weight_kgs=float(column[115]),
            baggage_capacity_cubicmeters=float(column[116]),
            internal_baggage_cubicmeters=float(column[117]),
            external_baggage_cubicmeters=float(column[118]),
            baggage_weight_kgs=float(column[119]),
            thrust_output_kgs=float(column[120]),
            total_thrust_kgs=float(column[121]),
            hourly_fuel_burn_LPH=float(column[122]),
            max_altitude_feet=float(column[123]),
            max_altitude_meters=float(column[124]),
            average_mission_length=float(column[125]),
            key_facts=column[126],
            aircraft_image=column[127],
            floorplan_drawing=column[128],
            NA_annual_captain=float(column[129]),
            NA_annual_first_office=float(column[130]),
            NA_annual_employee_benefits=float(column[131]),
            NA_annual_crew_training=float(column[132]),
            NA_annual_hangar=float(column[133]),
            NA_annual_insurance_hull=float(column[134]),
            NA_annual_insurance_liability=float(column[135]),
            NA_annual_management=float(column[136]),
            NA_annual_misc=float(column[137]),
            NA_annual_deprecation=float(column[138]),
            NA_annual_total=float(column[139]),
            NA_hourly_fuel=float(column[140]),
            NA_hourly_maintenance=float(column[141]),
            NA_hourly_engine_overhaul=float(column[142]),
            NA_hourly_ground_fees=float(column[143]),
            NA_hourly_misc=float(column[144]),
            NA_hourly_total=float(column[145]),
            EU_annual_captain=float(column[146]),
            EU_annual_first_office=float(column[147]),
            EU_annual_employee_benefits=float(column[148]),
            EU_annual_crew_training=float(column[149]),
            EU_annual_hangar=float(column[150]),
            EU_annual_insurance_hull=float(column[151]),
            EU_annual_insurance_liability=float(column[152]),
            EU_annual_management=float(column[153]),
            EU_annual_misc=float(column[154]),
            EU_annual_deprecation=float(column[155]),
            EU_annual_total=float(column[156]),
            EU_hourly_fuel=float(column[157]),
            EU_hourly_maintenance=float(column[158]),
            EU_hourly_engine_overhaul=float(column[159]),
            EU_hourly_ground_fees=float(column[160]),
            EU_hourly_misc=float(column[161]),
            EU_hourly_total=float(column[162]),
            SA_annual_captain=float(column[163]),
            SA_annual_first_office=float(column[164]),
            SA_annual_employee_benefits=float(column[165]),
            SA_annual_crew_training=float(column[166]),
            SA_annual_hangar=float(column[167]),
            SA_annual_insurance_hull=float(column[168]),
            SA_annual_insurance_liability=float(column[169]),
            SA_annual_management=float(column[170]),
            SA_annual_misc=float(column[171]),
            SA_annual_deprecation=float(column[172]),
            SA_annual_total=float(column[173]),
            SA_hourly_fuel=float(column[174]),
            SA_hourly_maintenance=float(column[175]),
            SA_hourly_engine_overhaul=float(column[176]),
            SA_hourly_ground_fees=float(column[177]),
            SA_hourly_misc=float(column[178]),
            SA_hourly_total=float(column[179]),
            AS_annual_captain=float(column[180]),
            AS_annual_first_office=float(column[181]),
            AS_annual_employee_benefits=float(column[182]),
            AS_annual_crew_training=float(column[183]),
            AS_annual_hangar=float(column[184]),
            AS_annual_insurance_hull=float(column[185]),
            AS_annual_insurance_liability=float(column[186]),
            AS_annual_management=float(column[187]),
            AS_annual_misc=float(column[188]),
            AS_annual_deprecation=float(column[189]),
            AS_annual_total=float(column[190]),
            AS_hourly_fuel=float(column[191]),
            AS_hourly_maintenance=float(column[192]),
            AS_hourly_engine_overhaul=float(column[193]),
            AS_hourly_ground_fees=float(column[194]),
            AS_hourly_misc=float(column[195]),
            AS_hourly_total=float(column[196]),
            NA_fuel_costs=float(column[197]),
            EU_fuel_costs=float(column[198]),
            SA_fuel_costs=float(column[199]),
            AS_fuel_costs=float(column[200]),
            acquisition_values=column[201],
            historical_data=column[202],
            fleet_flight_link=column[203],
        )
    context = {}
    return render(request, 'admin/upload-csv.html', context)


def upload_accidents(request):
    accidents = Accident.objects.all()
    prompt = {
        'order': 'Order of the CSV should be field1, field2, field3 ...',
        'products': accidents
    }
    if request.method == 'GET':
        return render(request, 'admin/upload-accidents.html', prompt)
    csv_file = request.FILES['file']
    data_set = csv_file.read().decode('utf-8')
    io_string = io.StringIO(data_set)
    next(io_string)
    for column in csv.reader(io_string, delimiter=',', quotechar='|'):
        incident, _ = Aircraft.objects.get_or_create(
            aircraft_name=column[1])
        accident, created = Accident.objects.update_or_create(
            country=column[0],
            aircraft_incident=incident,
            reg=column[2],
            date=column[3],
            occurrence=column[3],
            details=column[5],
        )
    context = {}
    return render(request, 'admin/upload-accidents.html', context)


@csrf_exempt
def process_webhook(request):
    if request.method == 'POST':
        # Process the user data sent by the webhook
        user_data = str(json.loads(request.body.decode("utf-8")))

        print(user_data)
        # name = user_data['user_data']['name']
        # email = user_data['user_data']['email']
        # print(name)
        # print(email)
        # Assuming you have a custom field 'favorite_color' in your user model
        # subscription = user_data.get('subscription')

        # Create a new User object using the user data
        # user = User.objects.create_user(
        #     username=name, email=email, password='new password')

        # Save the user object to the database
        # user.save()

        # Return a response indicating that the webhook was processed successfully
        return JsonResponse({'status': user_data})
    else:
        # Return a 404 error if the view is accessed with a non-POST request
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


@csrf_exempt
def process_webhook1(request):
    if request.method == 'POST':

        # Process the user data sent by the webhook
        user_data = json.loads(request.body.decode("utf-8"))
        print(user_data)
        name = user_data.get('name')
        email = user_data.get('email')
        # Assuming you have a custom field 'favorite_color' in your user model
        # subscription = user_data.get('subscription')

        # Create a new User object using the user data
        user = User.objects.create_user(
            username=name, email=email, password='new password')

        # Save the user object to the database
        user.save()

        # Return a response indicating that the webhook was processed successfully
        return JsonResponse({'status': 'success'})
    else:
        # Return a 404 error if the view is accessed with a non-POST request
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'})
    
@api_view(['POST'])
def update_limitation(request):
    print("success")
    db = get_mongo_client('healthcheck')
    collection = db['question_limits']

    user_data = json.loads(request.body.decode("utf-8"))
    name = user_data.get('name')

    limitation = 30

    if name != None:
        pipeline = [
            {
                '$match': {
                    "name": name
                }
            }
        ]
        limit_list = list(collection.aggregate(pipeline))
        current_date = datetime.now().strftime('%Y-%m-%d')
        if len(limit_list) == 0:
            collection.insert_one({
                'name': name,
                'last_date': current_date,
                'limitation': limitation
            })
        else:
            print(current_date)
            result = collection.find_one({'name': name, 'last_date': current_date})
            print(result)

            if result == None:
                try:
                    limitation = 30
                    collection.update_one({'name': name}, {'$set': {'last_date': current_date, 'limitation': limitation}})
                except Exception as e:
                    return JsonResponse({'error', e}, status=400)
            else:
                limitation = result['limitation']

        print(limitation)

        return JsonResponse({'status': 'success', 'limitation': limitation})
    else:
        return JsonResponse({'error': 'Unautorized'}, status=401)