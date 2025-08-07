import time


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
    while api_response.state != "NoOpInProgress":
        time.sleep(0.5)
        api_response = api.get_operation_state()
        if print_progress:
            if api_response.progress >= 0:
                if last_progress < 0:
                    last_progress = api_response.progress
                    print("%d%% " % api_response.progress, end = '', flush = True)
                else:
                    if api_response.progress - last_progress >= 5:
                        last_progress = api_response.progress
                        print("... %d%% " % api_response.progress, end = '', flush = True)

    if print_progress:
        print(" ", end = '')
    print ("OK")
