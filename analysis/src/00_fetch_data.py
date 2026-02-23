# %%
import os
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from pyairtable import Api

# Load environment variables
load_dotenv()

# Configuration
TOKEN = os.getenv("AIRTABLE_ACCESS_TOKEN")
BASE_ID = os.getenv("AIRTABLE_BASE_ID")
TABLE_ID = os.getenv("AIRTABLE_TABLE_ID")
OUTPUT_PATH = Path("./data/raw/experiment_data.csv")

# Check if environment variables are set, otherwise raise an error
if TOKEN is None or BASE_ID is None or TABLE_ID is None:
    raise EnvironmentError(
        "Missing Airtable configuration. Check your .env file for "
        "AIRTABLE_ACCESS_TOKEN, AIRTABLE_BASE_ID, and AIRTABLE_TABLE_ID."
    )


# %%
def fetch_airtable_data():
    """
    Fetches all records from the specified Airtable table and saves them as a CSV.
    """
    if not all([TOKEN, BASE_ID, TABLE_ID]):
        print("Error: Environment variables for Airtable are not fully set.")
        return

    print("Fetching data from Airtable...")
    api = Api(TOKEN)
    table = api.table(BASE_ID, TABLE_ID)

    # Get all records
    records = table.all()

    # Extract the 'fields' part of each record into a list of dicts
    data = [record["fields"] for record in records]

    # Convert to DataFrame
    df = pd.DataFrame(data)

    # Ensure the output directory exists
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Save to CSV
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Success! Data saved to {OUTPUT_PATH}")
    print(f"Total records fetched: {len(df)}")

    # Display the columns to verify the mapping
    print("\nDetected Columns:")
    print(df.columns.tolist())


# %%
if __name__ == "__main__":
    fetch_airtable_data()
