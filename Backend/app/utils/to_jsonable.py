from datetime import datetime, date
from decimal import Decimal
from collections.abc import Mapping, Iterable


def to_jsonable(x):
    if x is None:
        return None
    if hasattr(x, "to_dict") and callable(x.to_dict):
        return to_jsonable(x.to_dict())
    if hasattr(x, "model_dump"):
        return to_jsonable(x.model_dump())
    if isinstance(x, (str, int, float, bool)):
        return x
    if isinstance(x, Decimal):
        return float(x)
    if isinstance(x, (datetime, date)):
        return x.isoformat()
    if isinstance(x, Mapping):
        return {k: to_jsonable(v) for k, v in x.items()}
    if isinstance(x, Iterable) and not isinstance(x, (str, bytes)):
        return [to_jsonable(i) for i in x]
    if hasattr(x, "__dict__"):
        return to_jsonable(vars(x))
    return str(x)
