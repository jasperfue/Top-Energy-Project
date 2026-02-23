# %%
from pathlib import Path

import numpy as np
import pandas as pd

# Define paths
RAW_DATA_PATH = Path("./data/raw/experiment_data.csv")
PROCESSED_DATA_PATH = Path("./data/processed/cleaned_data.csv")


# %%
def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans the raw survey data, reverses necessary items, and calculates
    construct scores for the Master Thesis analysis.
    """
    df_clean = df.copy()

    # --- 1. Reverse UEQ-S Swapped Items ---
    # Assuming a 1-7 Likert scale: reversed_value = 8 - value
    ueq_swapped = ["ueq_2_swapped", "ueq_4_swapped", "ueq_6_swapped", "ueq_8_swapped"]
    for col in ueq_swapped:
        df_clean[col] = 8 - df_clean[col]

    # --- 2. Reverse ATI Items ---
    # Franke et al. (2018) uses a 6-point scale. But for consistency we used a 7-point scale. Adjust the reversal accordingly.
    ati_reversed = ["afftech_q3", "afftech_q6", "afftech_q8"]
    for col in ati_reversed:
        df_clean[col] = 8 - df_clean[col]

    # --- 3. Calculate Construct Scores (Means) ---

    # ATI Score
    ati_cols = [f"afftech_q{i}" for i in range(1, 10)]
    df_clean["ATI_Score"] = df_clean[ati_cols].mean(axis=1)

    # Trust Dimensions
    df_clean["Trust_Competence"] = df_clean[
        ["trust_comp_1", "trust_comp_2", "trust_comp_3", "trust_comp_4"]
    ].mean(axis=1)
    df_clean["Trust_Benevolence"] = df_clean[
        ["trust_ben_1", "trust_ben_2", "trust_ben_3"]
    ].mean(axis=1)
    df_clean["Trust_Integrity"] = df_clean[
        ["trust_int_1", "trust_int_2", "trust_int_3", "trust_int_4"]
    ].mean(axis=1)

    # Overall Trust (Optional: Often useful for the main mediation model)
    trust_all_cols = [c for c in df_clean.columns if c.startswith("trust_")]
    df_clean["Trust_Overall"] = df_clean[trust_all_cols].mean(axis=1)

    # Subjective Understanding
    df_clean["Understanding_Subjective"] = df_clean[
        ["understanding_q1", "understanding_q2"]
    ].mean(axis=1)

    # Implementation Intention
    df_clean["Intention"] = df_clean[
        ["intention_q1", "intention_q2", "intention_q3"]
    ].mean(axis=1)

    # UEQ-S Scores (Pragmatic: Items 1-4, Hedonic: Items 5-8)
    df_clean["UEQ_Pragmatic"] = df_clean[
        ["ueq_1", "ueq_2_swapped", "ueq_3", "ueq_4_swapped"]
    ].mean(axis=1)
    df_clean["UEQ_Hedonic"] = df_clean[
        ["ueq_5", "ueq_6_swapped", "ueq_7", "ueq_8_swapped"]
    ].mean(axis=1)
    df_clean["UEQ_Overall"] = df_clean[
        [c for c in df_clean.columns if c.startswith("ueq_")]
    ].mean(axis=1)

    # --- 4. Score Objective Understanding ---
    CORRECT_ANSWER_Q3 = "understanding_q3_option1"
    CORRECT_ANSWER_Q4 = "understanding_q4_option2"

    df_clean["Understanding_Obj_Q3"] = np.where(
        df_clean["understanding_q3"] == CORRECT_ANSWER_Q3, 1, 0
    )
    df_clean["Understanding_Obj_Q4"] = np.where(
        df_clean["understanding_q4"] == CORRECT_ANSWER_Q4, 1, 0
    )

    # Sum of correct answers (0, 1, or 2 points)
    df_clean["Understanding_Objective"] = (
        df_clean["Understanding_Obj_Q3"] + df_clean["Understanding_Obj_Q4"]
    )

    # --- 5. Calculate Task Duration (Minutes) ---
    df_clean["Startzeit"] = pd.to_datetime(df_clean["Startzeit"])
    df_clean["Endzeit"] = pd.to_datetime(df_clean["Endzeit"])
    df_clean["Duration_Minutes"] = (
        df_clean["Endzeit"] - df_clean["Startzeit"]
    ).dt.total_seconds() / 60.0

    # --- 6. Handle Time Outliers ---
    # Every participant should reasonably complete the survey within 60 minutes. Flag and set to NaN if above this threshold.
    upper_threshold = 60.0  # minutes
    outliers_mask = df_clean["Duration_Minutes"] > upper_threshold
    outliers_count = outliers_mask.sum()

    if outliers_count > 0:
        print(
            f"Note: {outliers_count} participants exceeded {upper_threshold} min. Duration set to NaN."
        )
        df_clean.loc[outliers_mask, "Duration_Minutes"] = np.nan

    # --- 7. Encode Ordinal Covariates for ANCOVA ---
    # We map the categorical strings to numeric ordinal values
    energy_mapping = {"none": 1, "basic": 2, "advanced": 3, "expert": 4}

    invest_mapping = {
        "none": 1,
        "theoretical": 2,
        "practical_basic": 3,
        "practical_professional": 4,
    }

    # Create new numeric columns for statistical inference
    df_clean["Energy_Knowledge_Num"] = df_clean["energy_knowledge"].map(energy_mapping)
    df_clean["Investment_Experience_Num"] = df_clean["investment_experience"].map(
        invest_mapping
    )

    return df_clean


# %%
if __name__ == "__main__":
    # Load raw data
    if RAW_DATA_PATH.exists():
        df_raw = pd.read_csv(RAW_DATA_PATH)
        print(f"Loaded {len(df_raw)} records from {RAW_DATA_PATH.name}")

        # Clean data
        df_processed = clean_data(df_raw)

        # Save processed data
        PROCESSED_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        df_processed.to_csv(PROCESSED_DATA_PATH, index=False)
        print(f"Data successfully cleaned and saved to {PROCESSED_DATA_PATH}")

        # Display a quick sanity check
        print("\n--- Construct Score Averages by Condition ---")
        summary = df_processed.groupby("Studienvariante")[
            [
                "Understanding_Subjective",
                "Understanding_Objective",
                "Trust_Overall",
                "Intention",
            ]
        ].mean()
        print(summary)

    else:
        print(f"Error: Raw data file not found at {RAW_DATA_PATH}")
