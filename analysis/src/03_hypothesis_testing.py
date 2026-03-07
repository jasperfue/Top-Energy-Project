# %%
# =============================================================================
# 03_hypothesis_testing.py
# Hypothesis testing for Master's Thesis RCT
# H1a/b: Format -> Understanding (Objective/Subjective)
# H2a/b: Format -> Trust Dimensions (Competence/Benevolence/Integrity)
# H3a/b: Understanding -> Trust
# H3c: Trust -> Implementation Intention
# H3d: Format -> Understanding -> Trust -> Implementation Intention (Sequential)
# =============================================================================

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import pingouin as pg
import seaborn as sns
from statsmodels.formula.api import ols
from statsmodels.stats.anova import anova_lm
from statsmodels.stats.multitest import multipletests

# --- Paths ---
PROCESSED_DATA_PATH = Path("./data/processed/cleaned_data.csv")
PLOTS_PATH = Path("./output/plots")
PLOTS_PATH.mkdir(parents=True, exist_ok=True)

# --- Plot style (academic) ---
sns.set_theme(style="whitegrid", context="paper", font_scale=1.2)
plt.rcParams.update({"figure.dpi": 150, "savefig.dpi": 300, "savefig.bbox": "tight"})

# %%
# --- Load Data ---
df = pd.read_csv(PROCESSED_DATA_PATH)
print(
    f"Loaded {len(df)} participants | Conditions: {df['Studienvariante'].unique().tolist()}"
)
print(f"Note: Small N={len(df)} — interpret p-values alongside effect sizes (η²p).\n")

# Binary encoding for mediation (Dashboard=1, Chat=0)
df["Studienvariante_Num"] = (df["Studienvariante"] == "Dashboard").astype(int)

# --- Variable definitions ---
CONDITION = "Studienvariante"
CONDITION_NUM = "Studienvariante_Num"

UNDERSTANDING_DVS = ["Understanding_Subjective", "Understanding_Objective"]
TRUST_DVS = ["Trust_Competence", "Trust_Benevolence", "Trust_Integrity"]
INTENTION_DV = "Intention"
TRUST_OVERALL = "Trust_Overall"

# %%
# =============================================================================
# SECTION 1: Covariate Selection Check
# Pearson correlations between potential covariates and main DVs
# =============================================================================
POTENTIAL_COVARIATES = [
    "ATI_Score",
    "Energy_Knowledge_Num",
    "Investment_Experience_Num",
]
MAIN_DVS = [
    "Understanding_Subjective",
    "Understanding_Objective",
    "Trust_Overall",
    "Intention",
]

print("=" * 65)
print("COVARIATE SELECTION CHECK — Pearson Correlations (r) with DVs")
print("=" * 65)

corr_rows = []
covariate_pvals = {cov: {} for cov in POTENTIAL_COVARIATES}
for cov in POTENTIAL_COVARIATES:
    row = {"Covariate": cov}
    for dv in MAIN_DVS:
        result = pg.corr(df[cov], df[dv], method="pearson")
        r = result["r"].values[0]
        p = result["p-val"].values[0]
        covariate_pvals[cov][dv] = p
        sig = "*" if p < 0.05 else ""
        row[dv] = f"{r:.3f}{sig}"
    corr_rows.append(row)

corr_table = pd.DataFrame(corr_rows).set_index("Covariate")
print(corr_table.to_string())
print("\n* p < .05 | Values are Pearson r")

# Dynamically select covariates with p < 0.10 for at least one main DV
selected_covariates = [
    cov
    for cov in POTENTIAL_COVARIATES
    if any(p < 0.10 for p in covariate_pvals[cov].values())
]
print(
    f"\nCorrelation-significant covariate(s) (p < .10 with ≥1 DV): {selected_covariates}"
)

# All three covariates are included in models regardless of correlation significance
# (pre-specified based on theory; the check above is informational only)
COVARIATES = POTENTIAL_COVARIATES
print(f"Covariates used in all models: {COVARIATES}")

# %%
# =============================================================================
# ANCOVA helper using statsmodels OLS + Type III SS
# =============================================================================


def run_ancova(
    data: pd.DataFrame, dv: str, between: str, covariates: list[str]
) -> pd.DataFrame:
    """
    Run a one-way ANCOVA via OLS (Type III SS) and print the ANOVA table
    with partial eta-squared (η²p = SS_effect / (SS_effect + SS_residual)).
    Returns the full ANOVA table DataFrame.
    """
    covar_terms = " + ".join(covariates)
    formula = f"Q('{dv}') ~ C(Q('{between}')) + {covar_terms}"
    model = ols(formula, data=data).fit()
    aov_table = anova_lm(model, typ=3)

    label_map = {
        f"C(Q('{between}'))": between,
        "Residual": "Residual",
        "Intercept": "Intercept",
    }
    for cov in covariates:
        label_map[cov] = cov
    aov_table.index = [label_map.get(i, i) for i in aov_table.index]

    ss_residual = aov_table.loc["Residual", "sum_sq"]
    aov_table["η²p"] = aov_table["sum_sq"].apply(
        lambda ss: round(ss / (ss + ss_residual), 3)
    )
    aov_table.loc["Residual", "η²p"] = np.nan

    display_cols = ["sum_sq", "df", "F", "PR(>F)", "η²p"]
    print(
        aov_table.loc[aov_table.index != "Intercept", display_cols]
        .rename(columns={"sum_sq": "SS", "df": "DF", "PR(>F)": "p"})
        .to_string()
    )

    desc = data.groupby(between)[dv].agg(["mean", "std", "count"]).round(3)
    print(f"\n  Group means:\n{desc.to_string()}")

    return aov_table


# %%
# =============================================================================
# SECTION 2: H1a & H1b — Effect of Format on Understanding (ANCOVA)
# =============================================================================
print("\n" + "=" * 65)
print("H1a & H1b: ANCOVA — Understanding")
print("Between-factor: Studienvariante | Covariate(s):", COVARIATES)
print("=" * 65)

h1_pvals = {}
for dv in UNDERSTANDING_DVS:
    print(f"\n--- DV: {dv} ---")
    aov = run_ancova(df, dv, CONDITION, COVARIATES)
    h1_pvals[dv] = aov.loc[CONDITION, "PR(>F)"]

# Bonferroni correction across H1 DVs
_, h1_pvals_corr, _, _ = multipletests(list(h1_pvals.values()), method="bonferroni")
print("\n  Bonferroni-corrected p-values (H1):")
for dv, p_adj in zip(h1_pvals.keys(), h1_pvals_corr):
    sig = "(*)" if p_adj < 0.05 else ""
    print(f"    {dv}: p_adj = {p_adj:.3f} {sig}")

# %%
# =============================================================================
# SECTION 3: H2a & H2b — Effect of Format on Trust (ANCOVA)
# =============================================================================
print("\n" + "=" * 65)
print("H2a & H2b: ANCOVA — Trust Dimensions")
print("Between-factor: Studienvariante | Covariate(s):", COVARIATES)
print("=" * 65)

h2_pvals = {}
for dv in TRUST_DVS:
    print(f"\n--- DV: {dv} ---")
    aov = run_ancova(df, dv, CONDITION, COVARIATES)
    h2_pvals[dv] = aov.loc[CONDITION, "PR(>F)"]

# Bonferroni correction across H2 DVs
_, h2_pvals_corr, _, _ = multipletests(list(h2_pvals.values()), method="bonferroni")
print("\n  Bonferroni-corrected p-values (H2):")
for dv, p_adj in zip(h2_pvals.keys(), h2_pvals_corr):
    sig = "(*)" if p_adj < 0.05 else ""
    print(f"    {dv}: p_adj = {p_adj:.3f} {sig}")

# %%
# =============================================================================
# ADDITIONAL ANALYSIS: Direct Effect on Implementation Intention (ANCOVA)
# Note: This is not a primary hypothesis (H1/H2), as the effect is modeled
#       via mediation in H3d. However, it provides a baseline comparison
#       of the two formats regarding the final outcome variable.
# =============================================================================
print("\n" + "=" * 65)
print("ADDITIONAL ANALYSIS: Direct Effect on Implementation Intention")
print("Between-factor: Studienvariante | Covariate(s):", COVARIATES)
print("=" * 65)

# Run ANCOVA for the intention variable
aov_idx = run_ancova(df, INTENTION_DV, CONDITION, COVARIATES)
p_val_direct = aov_idx.loc[CONDITION, "PR(>F)"]

print("\nDynamic Interpretation:")
if p_val_direct < 0.05:
    print(f"  There is a SIGNIFICANT direct difference (p = {p_val_direct:.3f})")
    print("  between the formats regarding Implementation Intention.")
else:
    print(f"  There is NO significant direct difference (p = {p_val_direct:.3f})")
    print("  between the formats. This suggests that the impact of the ")
    print("  explanation format may be fully absorbed by the mediators (H3d).")

# %%
# =============================================================================
# SECTION 4: H3a, H3b & H3c — Direct Effects on Trust and Intention
# =============================================================================
print("\n" + "=" * 65)
print("H3a, H3b & H3c: DIRECT EFFECTS (Multiple Regression)")
print("=" * 65)

covar_str = " + ".join(COVARIATES)

# --- H3a & H3b: Understanding -> Trust ---
print("\n--- H3a & H3b: Effect of Understanding on Trust_Overall ---")
formula_h3ab = (
    f"Trust_Overall ~ Understanding_Objective + Understanding_Subjective + {covar_str}"
)
model_h3ab = ols(formula_h3ab, data=df).fit()
print(model_h3ab.summary().tables[1])

# --- H3c: Trust -> Intention ---
print("\n--- H3c: Effect of Trust_Overall on Intention ---")
formula_h3c = f"Intention ~ Trust_Overall + {covar_str}"
model_h3c = ols(formula_h3c, data=df).fit()
print(model_h3c.summary().tables[1])

# %%
# =============================================================================
# SECTION 5: H3d — Sequential Mediation Path Analyses
# =============================================================================
print("\n" + "=" * 65)
print("H3d: SEQUENTIAL MEDIATION ANALYSIS")
print(f"IV: {CONDITION_NUM} (Dashboard=1, Chat=0) | DV: {INTENTION_DV}")
print("=" * 65)

N_BOOTSTRAP = 5000
RNG = np.random.default_rng(42)


def _estimate_indirect_effect(data: pd.DataFrame, mediator_name: str) -> float:
    """Estimate a1 × d21 × b2 on a (possibly resampled) dataset."""
    covar_str = " + ".join(COVARIATES)
    covar_suffix = f" + {covar_str}" if COVARIATES else ""

    # Path a1: X -> M1 (controlling for covariates)
    m1 = ols(f"Q('{mediator_name}') ~ {CONDITION_NUM}{covar_suffix}", data=data).fit()
    a1 = m1.params[CONDITION_NUM]

    # Path d21: M1 -> M2 (controlling for X and covariates)
    m2 = ols(
        f"Q('{TRUST_OVERALL}') ~ {CONDITION_NUM} + Q('{mediator_name}'){covar_suffix}",
        data=data,
    ).fit()
    d21 = m2.params[f"Q('{mediator_name}')"]

    # Path b2: M2 -> Y (controlling for X, M1, and covariates)
    m3 = ols(
        f"{INTENTION_DV} ~ {CONDITION_NUM} + Q('{mediator_name}') + Q('{TRUST_OVERALL}'){covar_suffix}",
        data=data,
    ).fit()
    b2 = m3.params[f"Q('{TRUST_OVERALL}')"]

    return a1 * d21 * b2


def analyze_sequential_chain(mediator_name: str, mediator_label: str) -> bool:
    """
    Test the sequential mediation chain X -> M1 -> M2 -> Y via bootstrapping
    (Hayes, 2018, PROCESS conventions). Reports individual path coefficients
    for interpretability and a bootstrapped 95% CI for the indirect effect.
    """
    print(f"\n--- Analysis for Chain: via {mediator_label} ---")
    covar_str = " + ".join(COVARIATES)
    covar_suffix = f" + {covar_str}" if COVARIATES else ""

    # --- Individual paths on the original data (descriptive) ---
    m1 = ols(f"Q('{mediator_name}') ~ {CONDITION_NUM}{covar_suffix}", data=df).fit()
    coef1, p1 = m1.params[CONDITION_NUM], m1.pvalues[CONDITION_NUM]

    m2 = ols(
        f"Q('{TRUST_OVERALL}') ~ {CONDITION_NUM} + Q('{mediator_name}'){covar_suffix}",
        data=df,
    ).fit()
    coef2, p2 = m2.params[f"Q('{mediator_name}')"], m2.pvalues[f"Q('{mediator_name}')"]

    m3 = ols(
        f"{INTENTION_DV} ~ {CONDITION_NUM} + Q('{mediator_name}') + Q('{TRUST_OVERALL}'){covar_suffix}",
        data=df,
    ).fit()
    coef3, p3 = m3.params[f"Q('{TRUST_OVERALL}')"], m3.pvalues[f"Q('{TRUST_OVERALL}')"]

    print(f"Path a1  (Format -> {mediator_label}):  b = {coef1:.3f}, p = {p1:.3f}")
    print(f"Path d21 ({mediator_label} -> Trust):   b = {coef2:.3f}, p = {p2:.3f}")
    print(f"Path b2  (Trust -> Intention):           b = {coef3:.3f}, p = {p3:.3f}")

    # --- Bootstrapped indirect effect (a1 × d21 × b2) ---
    point_estimate = _estimate_indirect_effect(df, mediator_name)
    boot_estimates = np.empty(N_BOOTSTRAP)
    for i in range(N_BOOTSTRAP):
        sample = df.sample(n=len(df), replace=True, random_state=int(RNG.integers(1e9)))
        try:
            boot_estimates[i] = _estimate_indirect_effect(sample, mediator_name)
        except Exception:
            boot_estimates[i] = np.nan

    boot_estimates = boot_estimates[~np.isnan(boot_estimates)]
    ci_lo, ci_hi = np.percentile(boot_estimates, [2.5, 97.5])
    supported = not (ci_lo <= 0 <= ci_hi)

    print(f"\n  Indirect effect (a1×d21×b2): {point_estimate:.4f}")
    print(f"  Bootstrap 95% CI [{N_BOOTSTRAP} iterations]: [{ci_lo:.4f}, {ci_hi:.4f}]")
    print(
        f"  Conclusion: {'SUPPORTED' if supported else 'NOT SUPPORTED'} (CI {'excludes' if supported else 'includes'} zero)"
    )

    return supported


# Execute analysis for both chains
success_obj = analyze_sequential_chain(
    "Understanding_Objective", "Objective Understanding"
)
success_subj = analyze_sequential_chain(
    "Understanding_Subjective", "Subjective Understanding"
)

print("\n" + "-" * 30)
print("FINAL HYPOTHESIS RESULT (H3d):")
if success_obj or success_subj:
    print(
        "Hypothesis H3d is SUPPORTED (≥1 chain: bootstrapped indirect effect CI excludes zero)."
    )
else:
    print(
        "Hypothesis H3d is REJECTED (no significant indirect effect found via bootstrapping)."
    )
print("-" * 30)

# %%
# =============================================================================
# SECTION 6: Visualizations
# =============================================================================

CONDITION_ORDER = ["Chat", "Dashboard"]
CONDITION_PALETTE = {"Chat": "#4C72B0", "Dashboard": "#DD8452"}


def ci95(series: pd.Series) -> float:
    n = series.count()
    se = series.std(ddof=1) / np.sqrt(n)
    return 1.96 * se


def plot_bar_ci(
    ax: plt.Axes,
    variables: list[str],
    labels: list[str],
    title: str,
    ylabel: str = "Mean Score (1–7)",
    ylim: tuple = (1, 7.5),
) -> None:
    x = np.arange(len(variables))
    width = 0.35
    offsets = {"Chat": -width / 2, "Dashboard": width / 2}

    for cond, offset in offsets.items():
        means = [df[df[CONDITION] == cond][v].mean() for v in variables]
        errors = [ci95(df[df[CONDITION] == cond][v]) for v in variables]
        ax.bar(
            x + offset,
            means,
            width,
            label=cond,
            color=CONDITION_PALETTE[cond],
            yerr=errors,
            capsize=5,
            error_kw={"elinewidth": 1.5, "ecolor": "black"},
            alpha=0.88,
        )

    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=11)
    ax.set_ylabel(ylabel, fontsize=11)
    ax.set_title(title, fontsize=12, fontweight="bold")
    ax.set_ylim(ylim)
    ax.legend(title="Condition", frameon=True)
    ax.yaxis.grid(True, linestyle="--", alpha=0.7)
    ax.set_axisbelow(True)


# Generate and save plots (A, B, C)
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 5))
plot_bar_ci(
    ax1,
    ["Understanding_Subjective"],
    ["Subjective"],
    "Subjective Understanding",
    ylim=(1, 7.5),
)
plot_bar_ci(
    ax2,
    ["Understanding_Objective"],
    ["Objective"],
    "Objective Understanding",
    ylabel="Correct Answers (0–2)",
    ylim=(0, 2.5),
)
fig.suptitle("H1: Understanding by Explanation Type", fontsize=14, fontweight="bold")
fig.tight_layout()
fig.savefig(PLOTS_PATH / "H1_understanding.png")
plt.close(fig)

fig, ax = plt.subplots(figsize=(7, 5))
plot_bar_ci(
    ax,
    ["Trust_Competence", "Trust_Benevolence", "Trust_Integrity"],
    ["Competence", "Benevolence", "Integrity"],
    "H2: Trust Dimensions by Explanation Type",
)
fig.tight_layout()
fig.savefig(PLOTS_PATH / "H2_trust_dimensions.png")
plt.close(fig)

fig, ax = plt.subplots(figsize=(4.5, 5))
plot_bar_ci(
    ax,
    ["Intention"],
    ["Implementation\nIntention"],
    "H3: Intention by Explanation Type",
)
fig.tight_layout()
fig.savefig(PLOTS_PATH / "H3_intention.png")
plt.close(fig)

print("\nAll plots saved to:", PLOTS_PATH)
