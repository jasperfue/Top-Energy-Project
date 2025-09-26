import time
import os
import csv
from datetime import datetime
import tepyapi
from tepyapi import apis
from tepyapi import models
from tepyapi import ApiException

# Minimal working example of the TOP-Energy API: This starts a simulation and writes the results to a CSV file.

# PREPARATION: Go to the installation folder (e.g. C:\Program Files\TOP-Energy X.X.X\API) and copy the example.py script, the data_input.csv file
# and Tutorial 07 (accessible via the TOP-Energy GUI startup dialogue) into a folder outside the user directory.
# The script runs with Tutorial 07 and the German names of components. Take note of the comments if you are using the English version.
# In the following lines, insert your TOP-Energy licence key and user name.

# ATTENTION: The output data is written into the CSV in english formatting and might not be correctly read by a German Excel installation.

# See configuration.py for a list of all supported configuration parameters.
configuration = tepyapi.Configuration(
    username="",  # TOP-Energy User's licence name
    password="",  # TOP-Energy User's licence key:
    host="http://localhost:8010"
)


def waitForApiFinished(api, print_progress):
    """Helper function for waiting for asynchronous API calls with optional progress printing
    :param api: The API class of type EfProcessManagementApi to be used for querying the state
    :print_progress: Flag whether the progress of the current operation should be printed"""
    last_progress = -1
    result = -1
    result_msg = "";
    # Checks if print_progress is true
    if print_progress:
        print("Progress: ", end='', flush=True)

    # Get the operation status from api
    api_response = api.get_operation_state()
    # Is an operation in progress, then execute the while loop
    while (api_response.state != "NoOpInProgress"):
        # Waits half a second
        time.sleep(0.5)
        # Get operation status
        api_response = api.get_operation_state()
        if (api_response.state == "Finished"):
            result = api_response.result_code
            result_msg = api_response.result_msg

        if print_progress:
            if (api_response.progress >= 0):
                if last_progress < 0:
                    last_progress = api_response.progress
                    print("%d%% " % api_response.progress, end='', flush=True)
                else:
                    if (api_response.progress - last_progress >= 5):
                        last_progress = api_response.progress
                        print("... %d%% " % api_response.progress, end='', flush=True)

    if print_progress:
        print(" ", end='')

    if (result == 0):
        print("OK")
    else:
        print('FAILURE!')

    return {'result': result, 'message': result_msg}


# Enter a context with an instance of the API client
with tepyapi.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    user_api = apis.EfUserManagementApi(api_client)
    process_api = apis.EfProcessManagementApi(api_client)
    data_api = apis.EfDataManagementApi(api_client)

    api_error = ''

    try:
        # Login to server
        print("Login user ... ", end='', flush=True)
        api_key = user_api.login()
        configuration.api_key['api_key'] = api_key
        print("OK")

        # Load a project (e.g. Tutorial 07)
        base_path = os.path.dirname(os.path.realpath(__file__)).replace('\\', '/');
        print("Load project ... ", end='', flush=True)
        prj_data = models.ApiProjectData(
            base_path + "/07_Gebäudeenergiesystem_mit_PV_und_Wärmepumpe.te-proj",
            # If English Tutorial is used: 07_Building_energy_system_with_PV_and_heat_pump.te-proj
            sourceType="file",
            readonly=False
        )
        api_response = process_api.load_project(project_data=prj_data)

        # Wait for finishing loading
        waitForApiFinished(process_api, False)

        # Update the project
        print("Update project ... ", flush=True)
        process_api.update_project()
        waitForApiFinished(process_api, True)

        print("Update messages:")
        print(process_api.get_update_messages())

        # Set an input time series
        print("Read data from CSV ... ", end='', flush=True)
        path_csv = base_path + "/data_input.csv"

        with open(path_csv, mode='r', newline='', encoding='utf-8') as file:
            reader = csv.reader(file, delimiter=';')

            list_electricitydemand_timepoint_value = []

            # Iteration through rows
            for row in reader:
                # Combine date and time and add time zone
                timepoint_str = f"{row[0]} {row[1]}"

                # Convert to string
                try:
                    timepoint = datetime.strptime(timepoint_str, "%d.%m.%Y %H:%M:%S")
                except ValueError as e:
                    print(f"Error parsing the timestamp: {timepoint_str}. Error: {e}")
                    continue

                value = float(row[2].replace(",", "."))
                list_electricitydemand_timepoint_value.append({'timepoint': timepoint, 'value': value})

            electricity_demand_time_series = models.DataValueTimeSeries('kW', 'GMT+01GermanyStandard',
                                                                        list_electricitydemand_timepoint_value)
            electricity_demand_dataobject = models.DataValueObject(time_series_value=electricity_demand_time_series)
            data_api.update_component_data('Strombedarf', electricity_demand_dataobject,
                                           path='Ist-Zustand.Simulation.Schema.Strombedarf')
            # If English Tutorial is used: data_api.update_component_data('Electricity demand', electricity_demand_dataobject,path='Reference Case.Simulation.Scheme.Electricity Demand')
            print("OK")

        # Setup parameters for simulation
        # The first 4 parameters are processed by TOP-Energy,
        # The solver_parameter list is passed to the optimization solver (the syntax therefore also depends on the solver choice!)
        # Setting parameters is optional, if none are set, project parameters are used.
        sim_params = models.SimParameter(
            solver="Gurobi",
            max_solving_time=60,
            max_gap=0.1,
            thread_count=0,
            solver_parameter=[
                models.SolverParameter(
                    name="Presolve",
                    type="int",
                    int_value=-1
                ),
                models.SolverParameter(
                    name="Heuristics",
                    type="double",
                    double_value=0.05
                )
            ]
        )

        # Start a simulation
        print("Start simulation ... ", flush=True)
        process_api.execute_module("Ist-Zustand.Simulation", params=sim_params)
        # If English Tutorial is used: process_api.execute_module("Reference Case.Simulation", params=sim_params)

        # Wait for finishing simulation
        status = waitForApiFinished(process_api, True)
        if status['result'] != 0:
            print("Simulation failed")
            print("Message: %s" % status['message'])
        else:
            # Get output time series
            print("Get result value ... ", end='', flush=True)
            data = data_api.get_data_from_component("Abgegebene Wärmeleistung",
                                                    path="Ist-Zustand.Simulation.Schema.Heißwasserkessel")
            # If English Tutorial is used:  data = data_api.get_data_from_component("Supplied heat", path="Reference Case.Simulation.Scheme.Gas Boiler")

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
            print("Write data to file 'data.csv' ... ", end='', flush=True)
            text_file = open(base_path + "/data.csv", "w")
            text_file.write(output)
            text_file.close()
            print("OK")

            # Save changes to project
            print("Save Project ... ", end='', flush=True)
            process_api.close_project(save=True)
            waitForApiFinished(process_api, False)

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
        print("Logout ... ", end='', flush=True)
        try:
            user_api.logout();
            print("OK")
        except:
            print("FAILURE!")
        print("Ready")
