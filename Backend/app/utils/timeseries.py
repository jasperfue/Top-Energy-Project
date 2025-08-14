from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime
from statistics import mean, pstdev
from typing import Any, Dict, List, Optional, Tuple
from math import floor

from tepyapi.model.data_value_object import DataValueObject
from tepyapi.model.data_value_time_series import DataValueTimeSeries

log = logging.getLogger('uvicorn.error')


@dataclass
class TSPoint:
    t: datetime
    v: float
    valid: bool


def _parse_ts_point(p: Dict[str, Any]) -> Optional[TSPoint]:
    try:
        return TSPoint(
            t=datetime.fromisoformat(p["timepoint"]),
            v=float(p["value"]),
            valid=bool(p.get("valid", True)),
        )
    except Exception:
        return None


def is_timeseries(obj: DataValueObject) -> bool:
    tsv = getattr(obj, "time_series_value", None)
    if DataValueTimeSeries and isinstance(tsv, DataValueTimeSeries):
        return True
    return False


def _median(seq: List[float]) -> Optional[float]:
    if not seq: return None
    s = sorted(seq)
    n = len(s)
    m = n // 2
    return s[m] if n % 2 else 0.5 * (s[m - 1] + s[m])


def summarize(points: List[TSPoint]) -> Dict[str, Any]:
    if not points: return {}
    valid_vals = [p.v for p in points if p.valid]
    total = len(points)
    valid_n = len(valid_vals)
    deltas = [(b.t - a.t).total_seconds() for a, b in zip(points, points[1:])]
    return {
        "count_total": total,
        "count_valid": valid_n,
        "count_invalid": total - valid_n,
        "valid_coverage": (valid_n / total) if total else 0.0,
        "mean": mean(valid_vals) if valid_vals else None,
        "median": _median(valid_vals) if valid_vals else None,
        "min": min(valid_vals) if valid_vals else None,
        "max": max(valid_vals) if valid_vals else None,
        "stddev": (pstdev(valid_vals) if len(valid_vals) > 1 else 0.0) if valid_vals else None,
        "sum": sum(valid_vals) if valid_vals else None,
        "start": points[0].t.isoformat(),
        "end": points[-1].t.isoformat(),
        "estimated_step_seconds": _median(deltas) if deltas else None,
    }


def _avg_xy(points: List[TSPoint]) -> Tuple[float, float]:
    xs = [p.t.timestamp() for p in points]
    ys = [p.v for p in points]
    return (sum(xs) / len(xs), sum(ys) / len(ys)) if points else (0.0, 0.0)


def lttb_downsample(points: List[TSPoint], threshold: int) -> List[TSPoint]:
    n = len(points)
    if threshold >= n or threshold <= 0: return points
    sampled = [points[0]]
    bucket_size = (n - 2) / (threshold - 2)
    a = 0
    for i in range(0, threshold - 2):
        left = int(floor((i + 1) * bucket_size)) + 1
        right = min(int(floor((i + 2) * bucket_size)) + 1, n)
        avg_x, avg_y = _avg_xy(points[left:right]) if right - left > 0 else (points[a].t.timestamp(), points[a].v)
        range_start = int(floor(i * bucket_size)) + 1
        range_end = min(int(floor((i + 1) * bucket_size)) + 1, n - 1)
        if range_end <= range_start: range_end = range_start + 1
        best_area = -1.0
        selected = None
        ax = points[a].t.timestamp()
        ay = points[a].v
        for idx in range(range_start, range_end):
            px = points[idx].t.timestamp()
            py = points[idx].v
            area = abs((ax - avg_x) * (py - ay) - (ax - px) * (avg_y - ay)) * 0.5
            if area > best_area: best_area = area; selected = idx
        sampled.append(points[selected])
        a = selected
    sampled.append(points[-1])
    return sampled


def process_timeseries_payload(payload: Dict[str, Any], max_points: int = 400) -> Dict[str, Any]:
    log.info("Processing timeseries payload %s", str(payload)[:100])
    tsv = payload["time_series_value"]
    points = [_parse_ts_point(p) for p in tsv.get("value_list", [])]
    points = [p for p in points if p is not None]
    points.sort(key=lambda x: x.t)
    summary = summarize(points)
    reduced = lttb_downsample(points, threshold=max_points)
    reduced_list = [{"timepoint": p.t.isoformat(), "value": p.v, "valid": p.valid} for p in reduced]
    out = dict(payload)
    out["time_series_value"] = {**tsv, "value_list": reduced_list}
    out["summary"] = {
        "type": "timeseries",
        "unit": tsv.get("unit"),
        **summary,
        "reduction": {
            "original_points": len(points),
            "returned_points": len(reduced_list),
            "method": "LTTB",
        },
    }
    return out
