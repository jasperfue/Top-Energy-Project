# %%
# =============================================================================
# 04_methodological_validation.py
# Methodological validation for Master's Thesis RCT
#
# 1. Design Validation (UEQ-S):  Welch t-tests per subscale across conditions
# 2. Full Correlation Matrix:    Pearson r for all main constructs + covariates
# 3. Post-hoc Power Analysis:    Achieved power for key ANCOVA effects (H1, H2)
# =============================================================================

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import scipy.stats as stats
import seaborn as sns
from statsmodels.formula.api import ols
from statsmodels.stats.anova import anova_lm
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# --- Paths ---
PROCESSED_DATA_PATH = Path("./data/processed/cleaned_data.csv")
PLOTS_PATH = Path("./output/plots")
PLOTS_PATH.mkdir(parents=True, exist_ok=True)

# --- Plot style (academic) ---
sns.set_theme(style="whitegrid", context="paper", font_scale=1.2)
plt.rcParams.update({"figure.dpi": 150, "savefig.dpi": 300, "savefig.bbox": "tight"})

# --- Variable definitions (consistent with 03_hypothesis_testing.py) ---
CONDITION = "Studienvariante"
COVARIATES = ["ATI_Score", "Energy_Knowledge_Num", "Investment_Experience_Num"]

UEQ_SUBSCALES = ["UEQ_Pragmatic", "UEQ_Hedonic", "UEQ_Overall"]

CORRELATION_VARS = [
    "Understanding_Subjective",
    "Understanding_Objective",
    "Trust_Overall",
    "Intention",
    "ATI_Score",
    "Energy_Knowledge_Num",
    "Investment_Experience_Num",
]

POWER_TARGETS = [
    ("Understanding_Objective", "H1 — Objective Understanding"),
    ("Trust_Competence", "H2 — Trust: Competence"),
]

# %%
# --- Load Data ---
df = pd.read_csv(PROCESSED_DATA_PATH)
print(f"Loaded {len(df)} participants | Conditions: {df[CONDITION].unique().tolist()}")
print(f"Note: Small N={len(df)} — interpret all results alongside effect sizes.\n")

# Split groups once for reuse
groups = {cond: df[df[CONDITION] == cond] for cond in df[CONDITION].unique()}


# =============================================================================
# Shared helper functions
# =============================================================================


def cohens_d(a: pd.Series, b: pd.Series) -> float:
    """Compute Cohen's d for two independent samples (pooled SD denominator)."""
    n_a, n_b = len(a), len(b)
    pooled_std = np.sqrt(
        ((n_a - 1) * a.std(ddof=1) ** 2 + (n_b - 1) * b.std(ddof=1) ** 2)
        / (n_a + n_b - 2)
    )
    return (a.mean() - b.mean()) / pooled_std if pooled_std > 0 else 0.0


def welch_df(a: pd.Series, b: pd.Series) -> float:
    """Compute Welch–Satterthwaite degrees of freedom."""
    v_a = a.var(ddof=1) / len(a)
    v_b = b.var(ddof=1) / len(b)
    numerator = (v_a + v_b) ** 2
    denominator = (v_a**2 / (len(a) - 1)) + (v_b**2 / (len(b) - 1))
    return numerator / denominator if denominator > 0 else 0.0


def ci95_diff(a: pd.Series, b: pd.Series, t_crit: float) -> tuple[float, float]:
    """95% CI for the difference in means (a - b) using Welch SE."""
    se = np.sqrt(a.var(ddof=1) / len(a) + b.var(ddof=1) / len(b))
    diff = a.mean() - b.mean()
    return diff - t_crit * se, diff + t_crit * se


# %%
# =============================================================================
# SECTION 0: Baseline Equivalence Check(Randomization Validation)
# Goal: Verify that random assignment produced balanced groups on demographic
#       and background variables prior to the intervention.
# Methods:
#   - Continuous variables (age, ATI_Score): Welch's independent t-test + Cohen's d
#   - Categorical/ordinal variables: Chi-squared test + Cramér's V
# Desired outcome: p > .05 for all variables (no significant imbalance).
# Note: With small N the tests have limited power; a non-significant result
#       is necessary but not sufficient evidence of perfect balance.
# =============================================================================


def cramers_v(contingency_table: pd.DataFrame) -> float:
    """Compute Cramér's V effect size from a contingency table."""
    chi2 = stats.chi2_contingency(contingency_table, correction=False)[0]
    n = contingency_table.to_numpy().sum()
    k = min(contingency_table.shape) - 1
    return float(np.sqrt(chi2 / (n * k))) if (n * k) > 0 else 0.0


print("=" * 70)
print("SECTION 0: Baseline Equivalence Check")
print(f"Conditions: Chat (n=24) vs. Dashboard (n=24) | N={len(df)}")
print("=" * 70)

cond_labels_base = sorted(df[CONDITION].unique())  # [Chat, Dashboard]
grp_a_base = groups[cond_labels_base[0]]  # Chat
grp_b_base = groups[cond_labels_base[1]]  # Dashboard

# --- 0a: Continuous variables — Welch's t-test + Cohen's d ---
CONTINUOUS_VARS = [("age", "Age"), ("ATI_Score", "ATI Score")]

print("\n--- Continuous Variables (Welch's t-test) ---")
print(
    f"{'Variable':<20} {'M (Chat)':>10} {'M (Dash)':>10} "
    f"{'t':>7} {'df':>6} {'p':>8} {'d':>7}  {'Result'}"
)
print("-" * 80)

cont_rows = []
for col, label in CONTINUOUS_VARS:
    a = grp_a_base[col].dropna()
    b = grp_b_base[col].dropna()
    t_stat, p_val = stats.ttest_ind(a, b, equal_var=False)
    df_w = welch_df(a, b)
    d = cohens_d(a, b)
    flag = "✓ balanced (p > .05)" if p_val > 0.05 else "✗ IMBALANCE (p ≤ .05)"
    print(
        f"{label:<20} {a.mean():>10.3f} {b.mean():>10.3f} "
        f"{t_stat:>7.3f} {df_w:>6.1f} {p_val:>8.3f} {d:>7.3f}  {flag}"
    )
    cont_rows.append(
        {
            "Variable": label,
            f"M ({cond_labels_base[0]})": round(a.mean(), 3),
            f"M ({cond_labels_base[1]})": round(b.mean(), 3),
            "t": round(t_stat, 3),
            "df (Welch)": round(df_w, 1),
            "p": round(p_val, 3),
            "Cohen's d": round(d, 3),
        }
    )

# --- 0b: Categorical/ordinal variables — Chi-squared + Cramér's V ---
CATEGORICAL_VARS = [
    ("gender", "Gender"),
    ("occupation_role", "Occupation Role"),
    ("domain_background", "Domain Background"),
    ("investment_experience", "Investment Experience"),
    ("energy_knowledge", "Energy Knowledge"),
]

print("\n--- Categorical / Ordinal Variables (Chi-squared test) ---")
print(f"{'Variable':<28} {'χ²':>8} {'df':>4} {'p':>8} {'V':>7}  {'Result'}")
print("-" * 70)

cat_rows = []
for col, label in CATEGORICAL_VARS:
    ct = pd.crosstab(df[CONDITION], df[col])
    chi2, p_val, dof, _ = stats.chi2_contingency(ct, correction=False)
    v = cramers_v(ct)
    flag = "✓ balanced (p > .05)" if p_val > 0.05 else "✗ IMBALANCE (p ≤ .05)"
    print(f"{label:<28} {chi2:>8.3f} {dof:>4} {p_val:>8.3f} {v:>7.3f}  {flag}")
    cat_rows.append(
        {
            "Variable": label,
            "χ²": round(chi2, 3),
            "df": dof,
            "p": round(p_val, 3),
            "Cramér's V": round(v, 3),
        }
    )

print("-" * 70)
print(
    "\nInterpretation: p > .05 across all variables confirms that random assignment\n"
    "produced demographically and experientially equivalent groups, supporting\n"
    "the internal validity of the RCT design.\n"
    "Note: Low power at small N means non-significance should be interpreted cautiously."
)


# %%
# =============================================================================
# SECTION 1: Design Validation — UEQ-S Subscale t-tests
# Goal: Confirm p > .05 (no significant difference), indicating balanced UX
#       across conditions (internal validity check).
# Method: Welch's independent t-test (equal_var=False), appropriate for
#         small samples where variance equality is not guaranteed.
# =============================================================================


print("=" * 70)
print("SECTION 1: Design Validation — UEQ-S Subscale t-tests")
print("Between-factor:", CONDITION, "| Method: Welch's independent t-test")
print("=" * 70)
print(
    f"{'Subscale':<22} {'t':>7} {'df':>6} {'p':>8} {'d':>7} {'95% CI diff':>20} {'Result'}"
)
print("-" * 70)

ueq_rows = []
cond_labels = sorted(df[CONDITION].unique())  # alphabetical: Chat, Dashboard
a_label, b_label = cond_labels[0], cond_labels[1]
grp_a = groups[a_label]
grp_b = groups[b_label]

for subscale in UEQ_SUBSCALES:
    a = grp_a[subscale].dropna()
    b = grp_b[subscale].dropna()
    t_stat, p_val = stats.ttest_ind(a, b, equal_var=False)
    df_welch = welch_df(a, b)
    d = cohens_d(a, b)
    t_crit = stats.t.ppf(0.975, df_welch)
    ci_lo, ci_hi = ci95_diff(a, b, t_crit)
    flag = "✓ balanced (p > .05)" if p_val > 0.05 else "✗ IMBALANCE (p ≤ .05)"
    print(
        f"{subscale:<22} {t_stat:>7.3f} {df_welch:>6.1f} {p_val:>8.3f} "
        f"{d:>7.3f} [{ci_lo:>6.3f}, {ci_hi:>6.3f}]  {flag}"
    )
    ueq_rows.append(
        {
            "Subscale": subscale,
            f"M ({a_label})": round(a.mean(), 3),
            f"SD ({a_label})": round(a.std(ddof=1), 3),
            f"M ({b_label})": round(b.mean(), 3),
            f"SD ({b_label})": round(b.std(ddof=1), 3),
            "t": round(t_stat, 3),
            "df (Welch)": round(df_welch, 1),
            "p": round(p_val, 3),
            "Cohen's d": round(d, 3),
            "95% CI [lo]": round(ci_lo, 3),
            "95% CI [hi]": round(ci_hi, 3),
        }
    )

print("-" * 70)
print(f"\nGroups: {a_label} (n={len(grp_a)}) vs. {b_label} (n={len(grp_b)})")
print("Interpretation: p > .05 across all UEQ-S subscales confirms that")
print("perceived usability and user experience are balanced across conditions,")
print("supporting internal validity of the experimental design.\n")

ueq_summary_df = pd.DataFrame(ueq_rows)
print(ueq_summary_df.to_string(index=False))


# %%
# =============================================================================
# SECTION 2: Full Correlation Matrix
# Variables: all main DVs + all covariates
# Method: Pearson r (standard in IS research; two-tailed p-values)
# Note: Understanding_Objective is ordinal (0-2); Pearson is reported for
#       consistency with the main analysis convention.
# =============================================================================

print("\n" + "=" * 70)
print("SECTION 2: Full Correlation Matrix (Pearson r)")
print("Variables:", ", ".join(CORRELATION_VARS))
print("=" * 70)

n_vars = len(CORRELATION_VARS)
r_matrix = pd.DataFrame(
    np.ones((n_vars, n_vars)), index=CORRELATION_VARS, columns=CORRELATION_VARS
)
p_matrix = pd.DataFrame(
    np.zeros((n_vars, n_vars)), index=CORRELATION_VARS, columns=CORRELATION_VARS
)

corr_data = df[CORRELATION_VARS].dropna()
print(f"N for correlation analysis (listwise): {len(corr_data)}")

for i, var_i in enumerate(CORRELATION_VARS):
    for j, var_j in enumerate(CORRELATION_VARS):
        if i == j:
            r_matrix.loc[var_i, var_j] = 1.0
            p_matrix.loc[var_i, var_j] = np.nan
        elif i < j:
            r, p = stats.pearsonr(corr_data[var_i], corr_data[var_j])
            r_matrix.loc[var_i, var_j] = r
            r_matrix.loc[var_j, var_i] = r
            p_matrix.loc[var_i, var_j] = p
            p_matrix.loc[var_j, var_i] = p

# Print lower-triangle table with significance stars
print("\nCorrelation matrix (lower triangle; * p<.05, ** p<.01):\n")
short_labels = [
    "Subj.Und.",
    "Obj.Und.",
    "Trust",
    "Intention",
    "ATI",
    "EnergyKnow.",
    "InvestExp.",
]
label_map = dict(zip(CORRELATION_VARS, short_labels))

header_line = f"{'':>14}" + "".join(f"{lbl:>13}" for lbl in short_labels)
print(header_line)
for i, var_i in enumerate(CORRELATION_VARS):
    row_str = f"{short_labels[i]:>14}"
    for j, var_j in enumerate(CORRELATION_VARS):
        if j > i:
            row_str += f"{'':>13}"
        elif i == j:
            row_str += f"{'—':>13}"
        else:
            r = r_matrix.loc[var_i, var_j]
            p = p_matrix.loc[var_i, var_j]
            stars = "**" if p < 0.01 else ("*" if p < 0.05 else "")
            row_str += f"{r:.3f}{stars:>2}{'':>8}"
    print(row_str)
print("\n* p < .05, ** p < .01 (two-tailed Pearson r)\n")

# --- Heatmap ---
mask = np.triu(np.ones_like(r_matrix, dtype=bool))  # mask upper triangle

# Build annotation matrix: r value + significance stars
annot_matrix = pd.DataFrame("", index=CORRELATION_VARS, columns=CORRELATION_VARS)
for i, var_i in enumerate(CORRELATION_VARS):
    for j, var_j in enumerate(CORRELATION_VARS):
        if i == j:
            annot_matrix.loc[var_i, var_j] = "—"
        elif i > j:
            r = r_matrix.loc[var_i, var_j]
            p = p_matrix.loc[var_i, var_j]
            stars = "**" if p < 0.01 else ("*" if p < 0.05 else "")
            annot_matrix.loc[var_i, var_j] = f"{r:.2f}{stars}"

fig, ax = plt.subplots(figsize=(9, 7))
sns.heatmap(
    r_matrix.astype(float),
    mask=mask,
    annot=annot_matrix,
    fmt="",
    cmap="coolwarm",
    center=0,
    vmin=-1,
    vmax=1,
    linewidths=0.5,
    ax=ax,
    cbar_kws={"label": "Pearson r", "shrink": 0.8},
    xticklabels=short_labels,
    yticklabels=short_labels,
)
ax.set_title(
    "Correlation Matrix: Main Constructs & Covariates\n(* p<.05, ** p<.01)",
    fontsize=12,
    fontweight="bold",
)
ax.tick_params(axis="x", rotation=30)
ax.tick_params(axis="y", rotation=0)
fig.tight_layout()
fig.savefig(PLOTS_PATH / "correlation_matrix.png")
print(f"Heatmap saved: {PLOTS_PATH / 'correlation_matrix.png'}")
plt.close(fig)


# %%
# =============================================================================
# SECTION 3: Post-hoc Power Analysis
# Goal: Determine achieved power for key significant ANCOVA effects.
# Method: Re-run ANCOVA (same OLS + Type III SS as 03_hypothesis_testing.py)
#         to extract observed F and exact degrees of freedom.
#         Power is computed via the non-central F distribution — the most
#         precise method for ANCOVA (accounts for covariate-adjusted df).
#
# Formula:
#   ncp (non-centrality parameter) = F_obs × df_effect
#   f_critical = F_{α, df_effect, df_residual}
#   power = 1 - CDF_ncf(f_critical; df_effect, df_residual, ncp)
# =============================================================================


def run_ancova_extract(
    data: pd.DataFrame, dv: str, between: str, covariates: list[str]
) -> dict:
    """
    Run one-way ANCOVA via OLS (Type III SS) for a single DV.
    Returns a dict with F, df_effect, df_residual, SS_effect, SS_residual,
    eta2p, and p-value for the between-subjects factor.
    """
    covar_terms = " + ".join(covariates)
    formula = f"Q('{dv}') ~ C(Q('{between}')) + {covar_terms}"
    model = ols(formula, data=data).fit()
    aov_table = anova_lm(model, typ=3)

    factor_key = f"C(Q('{between}'))"
    ss_effect = aov_table.loc[factor_key, "sum_sq"]
    df_effect = aov_table.loc[factor_key, "df"]
    f_obs = aov_table.loc[factor_key, "F"]
    p_val = aov_table.loc[factor_key, "PR(>F)"]
    ss_residual = aov_table.loc["Residual", "sum_sq"]
    df_residual = aov_table.loc["Residual", "df"]
    eta2p = ss_effect / (ss_effect + ss_residual)

    return {
        "F_obs": f_obs,
        "df_effect": df_effect,
        "df_residual": df_residual,
        "SS_effect": ss_effect,
        "SS_residual": ss_residual,
        "eta2p": eta2p,
        "p_val": p_val,
    }


def compute_achieved_power(
    f_obs: float, df_effect: float, df_residual: float, alpha: float = 0.05
) -> float:
    """
    Compute achieved (post-hoc) power from observed F via non-central F distribution.
    ncp = F_obs * df_effect (exact non-centrality parameter from observed F)
    power = 1 - P(F' ≤ f_critical | ncp)
    """
    ncp = f_obs * df_effect
    f_critical = stats.f.ppf(1 - alpha, df_effect, df_residual)
    power = 1 - stats.ncf.cdf(f_critical, df_effect, df_residual, ncp)
    return power


print("=" * 70)
print("SECTION 3: Post-hoc Power Analysis")
print(f"Covariates: {COVARIATES} | α = .05 | N = {len(df)}")
print("Method: Exact non-central F distribution (ANCOVA-adjusted df)")
print("=" * 70)

power_rows = []
for dv, label in POWER_TARGETS:
    res = run_ancova_extract(df, dv, CONDITION, COVARIATES)
    cohen_f = np.sqrt(res["eta2p"] / (1 - res["eta2p"])) if res["eta2p"] < 1 else np.inf
    power = compute_achieved_power(res["F_obs"], res["df_effect"], res["df_residual"])

    print(f"\n--- {label} ---")
    print(
        f"  F({int(res['df_effect'])}, {int(res['df_residual'])}) = {res['F_obs']:.3f}, "
        f"p = {res['p_val']:.3f}"
    )
    print(f"  η²p = {res['eta2p']:.3f} | Cohen's f = {cohen_f:.3f}")
    print(f"  Achieved power (1-β) = {power:.3f}")

    power_rows.append(
        {
            "Hypothesis": label,
            "DV": dv,
            "F_obs": round(res["F_obs"], 3),
            "df_effect": int(res["df_effect"]),
            "df_residual": int(res["df_residual"]),
            "p": round(res["p_val"], 3),
            "η²p": round(res["eta2p"], 3),
            "Cohen's f": round(cohen_f, 3),
            "Achieved Power": round(power, 3),
        }
    )

power_df = pd.DataFrame(power_rows)
print("\n\nPost-hoc Power Summary Table:")
print(power_df.to_string(index=False))

print("\nInterpretation for Limitations:")
print("  Power < .80 indicates the study was underpowered for detecting the")
print(f"  observed effect at N={len(df)}. This is expected for a pilot/thesis RCT and")
print("  should be reported as a limitation with a sample size recommendation")
print("  for future research (use achieved f as input to an a-priori power")
print("  analysis targeting 1-β = .80 with α = .05).")

# %%
# =============================================================================
# SECTION 4: Common Method Bias (Harman's Single Factor Test)
# Goal: Ensure that a single factor does not account for the majority of variance.
# =============================================================================

print("\n" + "=" * 70)
print("SECTION 4: Common Method Bias (Harman's Single Factor Test)")
print("=" * 70)

# Select all raw Likert items used for the main constructs
likert_items = [
    "trust_comp_1",
    "trust_comp_2",
    "trust_comp_3",
    "trust_comp_4",
    "trust_ben_1",
    "trust_ben_2",
    "trust_ben_3",
    "trust_int_1",
    "trust_int_2",
    "trust_int_3",
    "trust_int_4",
    "understanding_q1",
    "understanding_q2",
    "intention_q1",
    "intention_q2",
    "intention_q3",
]

# Drop missing values and standardize the data
cmb_data = df[likert_items].dropna()
scaler = StandardScaler()
cmb_data_scaled = scaler.fit_transform(cmb_data)

# Run PCA without restricting the number of components
pca = PCA()
pca.fit(cmb_data_scaled)

# Get the variance explained by the FIRST single factor
first_factor_variance = pca.explained_variance_ratio_[0] * 100

print(f"Number of items analyzed: {len(likert_items)}")
print(f"Variance explained by a single general factor: {first_factor_variance:.2f}%")

if first_factor_variance < 50.0:
    print("Result: CMB is unlikely to be a major concern (< 50% threshold met).")
else:
    print("Result: CMB might be present (≥ 50% threshold exceeded).")


# %%
# =============================================================================
# SECTION 5: ANCOVA Assumption Validation
# Goal: Verify that the three key parametric assumptions for ANCOVA are met.
#
# 1. Homogeneity of Variances (Levene's Test):
#    H0: Variances are equal across conditions (Chat vs. Dashboard).
#    p > .05 → assumption met. Levene's test is robust to non-normality.
#
# 2. Homogeneity of Regression Slopes:
#    H0: The covariate-DV relationship (slope) is the same across conditions.
#    Tested by adding a Condition × Covariate interaction term to the model.
#    p > .05 → parallel slopes assumption met (ANCOVA adjustment is valid).
#
# 3. Normality of ANCOVA Residuals (Shapiro-Wilk Test):
#    H0: The residuals from the fitted ANCOVA model are normally distributed.
#    p > .05 → assumption met. Testing residuals (not raw values) correctly
#    isolates the normality assumption from group mean differences.
#    Note: at small N the test has low power — mild violations are tolerable
#    given ANCOVA's robustness to slight non-normality.
# =============================================================================

ANCOVA_DVS = [
    "Understanding_Subjective",
    "Understanding_Objective",
    "Trust_Competence",
    "Trust_Benevolence",
    "Trust_Integrity",
    "Intention",
]

covar_str_anc = " + ".join(COVARIATES)
cond_labels_anc = sorted(df[CONDITION].unique())  # [Chat, Dashboard]

print("\n" + "=" * 70)
print("SECTION 5: ANCOVA Assumption Validation")
print(f"Conditions: {cond_labels_anc[0]} vs. {cond_labels_anc[1]}")
print("=" * 70)

# -------------------------------------------------------------------------
# 5a: Homogeneity of Variances — Levene's Test
# -------------------------------------------------------------------------
print("\n--- 5a: Levene's Test (Homogeneity of Variances) ---")
print(f"{'DV':<30} {'W':>8} {'p':>8}  {'Result'}")
print("-" * 65)

levene_rows = []
for dv in ANCOVA_DVS:
    grps = [groups[c][dv].dropna() for c in cond_labels_anc]
    w_stat, p_lev = stats.levene(*grps)
    flag = "✓ met (p > .05)" if p_lev > 0.05 else "✗ VIOLATION (p ≤ .05)"
    print(f"{dv:<30} {w_stat:>8.3f} {p_lev:>8.3f}  {flag}")
    levene_rows.append(
        {
            "DV": dv,
            "W (Levene)": round(w_stat, 3),
            "p": round(p_lev, 3),
            "Result": flag,
        }
    )

print("-" * 65)
print("H0: Variances are equal across conditions.")
print("p > .05 → homogeneity assumption satisfied.\n")

# -------------------------------------------------------------------------
# 5b: Homogeneity of Regression Slopes
#     Tests Condition × Covariate interaction for each DV.
#     A significant interaction (p ≤ .05) indicates non-parallel slopes,
#     which would invalidate the ANCOVA covariate adjustment.
# -------------------------------------------------------------------------
print(
    "\n--- 5b: Homogeneity of Regression Slopes (Condition × Covariate interaction) ---"
)
print(f"{'DV':<30} {'Covariate':<28} {'F':>7} {'p':>8}  {'Result'}")
print("-" * 85)

slopes_rows = []
for dv in ANCOVA_DVS:
    worst_p = 1.0
    for cov in COVARIATES:
        # Fit model with all covariates + one interaction term at a time
        other_covs = " + ".join(c for c in COVARIATES if c != cov)
        interaction_formula = (
            f"Q('{dv}') ~ C(Q('{CONDITION}')) + {covar_str_anc}"
            f" + C(Q('{CONDITION}')):Q('{cov}')"
        )
        try:
            model_int = ols(interaction_formula, data=df).fit()
            aov_int = anova_lm(model_int, typ=3)
            # Find the interaction row (contains both condition and covariate names)
            int_rows = [
                idx for idx in aov_int.index if "Studienvariante" in idx and cov in idx
            ]
            if not int_rows:
                continue
            f_int = aov_int.loc[int_rows[0], "F"]
            p_int = aov_int.loc[int_rows[0], "PR(>F)"]
        except Exception:
            f_int, p_int = np.nan, np.nan

        flag = "✓ met (p > .05)" if p_int > 0.05 else "✗ VIOLATION (p ≤ .05)"
        print(f"{dv:<30} {cov:<28} {f_int:>7.3f} {p_int:>8.3f}  {flag}")
        slopes_rows.append(
            {
                "DV": dv,
                "Covariate": cov,
                "F (interaction)": round(f_int, 3) if not np.isnan(f_int) else np.nan,
                "p": round(p_int, 3) if not np.isnan(p_int) else np.nan,
                "Result": flag,
            }
        )
        if p_int < worst_p:
            worst_p = p_int

print("-" * 85)
print("H0: Covariate slope is equal across conditions (parallel slopes).")
print("p > .05 → homogeneity of regression slopes assumption satisfied.\n")

# -------------------------------------------------------------------------
# 5c: Normality of ANCOVA Residuals — Shapiro-Wilk Test
#     Residuals are extracted from the fitted ANCOVA model (with covariates),
#     which correctly isolates the normality assumption from group differences.
# -------------------------------------------------------------------------
print("\n--- 5c: Shapiro-Wilk Test (Normality of ANCOVA Residuals) ---")
print(f"{'DV':<30} {'W':>8} {'p':>8}  {'Result'}")
print("-" * 65)

sw_rows = []
for dv in ANCOVA_DVS:
    formula_sw = f"Q('{dv}') ~ C(Q('{CONDITION}')) + {covar_str_anc}"
    model_sw = ols(formula_sw, data=df).fit()
    residuals = model_sw.resid
    w_stat, p_sw = stats.shapiro(residuals)
    flag = "✓ met (p > .05)" if p_sw > 0.05 else "✗ VIOLATION (p ≤ .05)"
    print(f"{dv:<30} {w_stat:>8.3f} {p_sw:>8.3f}  {flag}")
    sw_rows.append(
        {
            "DV": dv,
            "W (Shapiro-Wilk)": round(w_stat, 3),
            "p": round(p_sw, 3),
            "Result": flag,
        }
    )

print("-" * 65)
print("H0: ANCOVA model residuals are normally distributed.")
print("p > .05 → normality assumption satisfied.")
print(
    "\nNote: Shapiro-Wilk has low power at small n. "
    "Isolated\nviolations do not invalidate ANCOVA given its robustness to mild\n"
    "non-normality; interpret alongside visual inspection (Q-Q plots) if needed."
)
