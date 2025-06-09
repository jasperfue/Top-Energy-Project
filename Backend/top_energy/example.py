import time
import csv
import os
import openpyxl
from datetime import datetime
from openpyxl import workbook
import tepyapi
from tepyapi import apis
from tepyapi import models
from tepyapi import ApiException
from tepyapi.rest import RESTResponse
from tepyapi import apis,models,ApiException
from tepyapi.api import ef_data_management_api
from tepyapi.model.data_value_number import DataValueNumber
from tepyapi.model.data_value_time_series import DataValueTimeSeries
from tepyapi.model.data_value_object import DataValueObject

# Defining the host is optional and defaults to http://localhost:8010/v1.0
# See configuration.py for a list of all supported configuration parameters.
configuration = tepyapi.Configuration(
    username = "*",
    password = "*",
    host = "*"
)


def waitForApiFinished(msg, api, print_progress):
    """Helper function for waiting for asynchronous API calls with optional progress printing
    :param msg: A message to be printed
    :param api: The API class of type EfProcessManagementApi to be used for querying the state
    :print_progress: Flag whether the progress of the current operation should be printed
    """
    last_progress = -1
    print(msg, end = '' if not print_progress else None, flush = True)
    if print_progress:
        print("Progress: ", end = '', flush = True)
    api_response = api.get_operation_state()
    while (api_response.state != "NoOpInProgress"):
        time.sleep(0.5)
        api_response = api.get_operation_state()
        if print_progress:
            if (api_response.progress >= 0):
                if last_progress < 0:
                    last_progress = api_response.progress
                    print("%d%% " % api_response.progress, end = '', flush = True)
                else:
                    if (api_response.progress - last_progress >= 5):
                        last_progress = api_response.progress
                        print("... %d%% " % api_response.progress, end = '', flush = True)

    if print_progress:
        print(" ", end = '')
    print ("OK")


# Enter a context with an instance of the API client
with tepyapi.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    user_api = apis.EfUserManagementApi(api_client)
    process_api = apis.EfProcessManagementApi(api_client)
    data_api = apis.EfDataManagementApi(api_client)

    api_error = ''

    try:
        # Login to server
        print("Login user ... ", end = '', flush = True)
        api_key = user_api.login(lang='de') # 'de' or 'en', path names corresponding to the language
        configuration.api_key['api_key'] = api_key
        print("OK")

        # Load a project (e.g. Tutorial 4)
        base_path = os.path.dirname(os.path.realpath(__file__)).replace('\\', '/')
        print("Load project ... ", end = '', flush = True)
        print(base_path + "/Testprojekt.te-proj")
        prj_data = models.ApiProjectData(
            base_path + "/Testprojekt.te-proj",
            sourceType = "file",
            readonly = False
        )
        api_response = process_api.load_project(project_data=prj_data)

        # Wait for finishing simulation
        waitForApiFinished("", process_api, False)

        # Update the project
        print("Update project ... ", end = '', flush = True)
        process_api.update_project()
        waitForApiFinished("", process_api, True)

        print("Update messages:")
        print(process_api.get_update_messages())

        # Setup parameter for simulation // obsolete, bc. values can also be set in eSim node
        sim_params = models.SimParameter(
            solver="Auto",
            max_solving_time=60,
            max_gap=0.1,
            thread_count=0
        )

        # Set an input parameter
        value_nominal_power_Kessel = DataValueNumber(120.0, "kW")
        value_object_nominal_power_Kessel = DataValueObject(number_value=value_nominal_power_Kessel)
        data_api.update_component_data("Ist-Fall.eSim.Scheme.Kessel (Gas) 100 kW", "Thermische Nennleistung",value_object_nominal_power_Kessel)

        # Set an input time series
        path_csv = base_path + "/data_input.csv" # Time series has the same format as

        with open(path_csv, mode='r', newline='', encoding='utf-8') as file:
            reader = csv.reader(file, delimiter=';')

            list_electricitydemand_timepoint_value = []

            # Iteration through rows
            for row in reader:
                # Combine date and time and add time zone
                timepoint_str = f"{row[0]} {row[1]} +0100"

                # Convert to string
                try:
                    timepoint = datetime.strptime(timepoint_str, "%d.%m.%Y %H:%M:%S %z")
                except ValueError as e:
                    print(f"Fehler beim Parsen des Zeitstempels: {timepoint_str}. Fehler: {e}")
                    continue

                value = float(row[2].replace(",", "."))
                list_electricitydemand_timepoint_value.append({'timepoint': timepoint, 'value': value})

            electricity_demand_time_series = models.DataValueTimeSeries('kW', 'GMT+01GermanyStandard', list_electricitydemand_timepoint_value)
            electricity_demand_dataobject = models.DataValueObject(time_series_value=electricity_demand_time_series)
            data_api.update_component_data('Ist-Fall.eSim.Scheme.Strombedarf', 'Strombedarf', electricity_demand_dataobject)

        # Start a simulation
        print("Start simulation ... ", end = '', flush = True)
        process_api.execute_module("Ist-Fall.eSim", params=sim_params)

        # Wait for finishing simulation
        waitForApiFinished("", process_api, True)

        # Get output time series
        print("Get result value ... ", end = '', flush = True)
        data = data_api.get_data_from_component("Ist-Fall.eSim.Scheme.Kessel (Gas) 100 kW", "Abgegebene Wärmeleistung")
        ts_data = data.time_series_value
        output = "Unit: " + ts_data.unit + ", Timezone: " + ts_data.dst_information
        output += "\n\n"
        output += "timepoint; value"
        output += "\n"
        for item in ts_data.value_list:
            output += item.timepoint.strftime("%Y-%m-%d %H:%M:%S")
            output += ";"
            if (item.valid):
                output += str(item.value)
            else:
                output += 'NaN'
            output += "\n"

        print("OK")

        # Write data to CSV file
        print("Write data to file 'data.csv'")
        text_file = open(base_path + "/data.csv", "w")
        text_file.write(output)
        text_file.close()

        # Close project
        process_api.close_project(save=True)

    except ApiException as e:
        print("FAILURE!")
        print("Status Code: %i" % e.status)
        print("Reason: %s" % e.reason)
        if (not e.details is None):
            print("Error Code: %i" % e.details['code'])
            print("Message: %s" % e.details['msg'])

    except Exception as e:
        print("FAILURE!")
        print("Exception caught: %s" % e)

    finally:
        # Logout
        print("Logout ... ", end = '', flush = True)
        try:
            user_api.logout()
            print("OK")
        except:
            print("FAILURE!")
        print("Ready")
