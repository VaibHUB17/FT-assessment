"""
Freight Cost Tracking and Anomaly Detection Core Analytics Engine.
Calculates weekly weighted unit costs, trailing 8-week rolling baselines,
peer group baselines, and flags cost surges strictly following FreightTiger case study specifications.
"""

import csv
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, List, Tuple, Any, Optional


def parse_date(date_str: str) -> datetime:
    return datetime.strptime(date_str.strip(), "%Y-%m-%d")


def get_monday_week_of(date_str: str) -> str:
    """Weeks run Monday to Sunday; week_of is that week's Monday date (YYYY-MM-DD)."""
    dt = parse_date(date_str)
    monday = dt - timedelta(days=dt.weekday())
    return monday.strftime("%Y-%m-%d")


class FreightAnalyticsEngine:
    def __init__(self, shipments_path: str):
        self.shipments_path = shipments_path
        self.raw_records: List[Dict[str, Any]] = []
        self.route_info: Dict[str, str] = {}  # route -> route_type
        self.weekly_aggregates: Dict[Tuple[str, str], Dict[str, float]] = defaultdict(
            lambda: {"cost": 0.0, "tonne_km": 0.0, "shipments": 0}
        )
        self.route_week_costs: Dict[Tuple[str, str], float] = {}
        self.all_weeks: List[str] = []
        self.all_routes: List[str] = []

    def load_and_aggregate(self) -> None:
        """Reads shipment records and aggregates weekly freight cost and tonne-km."""
        with open(self.shipments_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                origin = row["origin"].strip()
                dest = row["destination"].strip()
                route = f"{origin}-{dest}"
                rtype = row["route_type"].strip()
                self.route_info[route] = rtype

                date_str = row["shipment_date"].strip()
                week_of = get_monday_week_of(date_str)

                qty = float(row["quantity_tonnes"])
                dist = float(row["distance_km"])
                cost = float(row["freight_cost_inr"])

                self.weekly_aggregates[(route, week_of)]["cost"] += cost
                self.weekly_aggregates[(route, week_of)]["tonne_km"] += (qty * dist)
                self.weekly_aggregates[(route, week_of)]["shipments"] += 1
                self.raw_records.append(row)

        for (rt, wk), data in self.weekly_aggregates.items():
            if data["tonne_km"] > 0:
                self.route_week_costs[(rt, wk)] = data["cost"] / data["tonne_km"]

        self.all_weeks = sorted(list(set(wk for (rt, wk) in self.weekly_aggregates.keys())))
        self.all_routes = sorted(list(set(rt for (rt, wk) in self.weekly_aggregates.keys())))

    def compute_own_history_baseline(self, route: str, current_week: str) -> Tuple[Optional[float], int]:
        """
        Calculates the route's trailing 8-week rolling average cost per tonne-km,
        using only weeks strictly before the current week (no look-ahead).
        If fewer than 8 prior weeks exist, uses all prior weeks available.
        """
        curr_dt = parse_date(current_week)
        prior_costs = []
        for i in range(1, 9):
            prev_wk = (curr_dt - timedelta(weeks=i)).strftime("%Y-%m-%d")
            if (route, prev_wk) in self.route_week_costs:
                prior_costs.append(self.route_week_costs[(route, prev_wk)])

        if not prior_costs:
            return None, 0
        return sum(prior_costs) / len(prior_costs), len(prior_costs)

    def compute_peer_baseline(self, route: str, current_week: str) -> Tuple[Optional[float], List[str]]:
        """
        Calculates the average cost per tonne-km, in that same week,
        across all other routes that share the same route_type (Short/Medium/Long).
        Excludes the route itself from its own peer average.
        """
        rtype = self.route_info.get(route)
        peer_routes = [r for r, t in self.route_info.items() if t == rtype and r != route]
        peer_costs = [
            self.route_week_costs[(pr, current_week)]
            for pr in peer_routes
            if (pr, current_week) in self.route_week_costs
        ]
        if not peer_costs:
            return None, peer_routes
        return sum(peer_costs) / len(peer_costs), peer_routes

    def analyze_all_route_weeks(self, threshold_pct: float = 20.0) -> List[Dict[str, Any]]:
        """
        Evaluates every route-week combination.
        Returns a list of candidate anomalies where cost is rising out of the ordinary
        (>= threshold_pct vs own history OR >= threshold_pct vs similar routes).
        """
        candidates: List[Dict[str, Any]] = []

        for route in self.all_routes:
            for week_of in self.all_weeks:
                if (route, week_of) not in self.route_week_costs:
                    continue

                cost = self.route_week_costs[(route, week_of)]
                own_avg, own_count = self.compute_own_history_baseline(route, week_of)
                peer_avg, peer_routes = self.compute_peer_baseline(route, week_of)

                pct_own = None
                if own_avg is not None and own_avg > 0:
                    pct_own = ((cost - own_avg) / own_avg) * 100.0

                pct_peer = None
                if peer_avg is not None and peer_avg > 0:
                    pct_peer = ((cost - peer_avg) / peer_avg) * 100.0

                # Check if cost is rising and looks out of ordinary
                is_anomaly = False
                if pct_own is not None and pct_own >= threshold_pct:
                    is_anomaly = True
                if pct_peer is not None and pct_peer >= threshold_pct:
                    is_anomaly = True

                entry = {
                    "route": route,
                    "route_type": self.route_info[route],
                    "week_of": week_of,
                    "cost_per_tonne_km": round(cost, 2),
                    "cost_per_tonne_km_raw": cost,
                    "own_baseline": own_avg,
                    "own_baseline_count": own_count,
                    "pct_own": pct_own,
                    "peer_baseline": peer_avg,
                    "peer_routes": peer_routes,
                    "pct_peer": pct_peer,
                    "is_candidate": is_anomaly,
                    "shipment_count": self.weekly_aggregates[(route, week_of)]["shipments"],
                    "total_cost_inr": self.weekly_aggregates[(route, week_of)]["cost"],
                    "total_tonne_km": self.weekly_aggregates[(route, week_of)]["tonne_km"],
                }
                candidates.append(entry)

        # Sort chronologically by week_of
        candidates.sort(key=lambda x: (x["week_of"], x["route"]))
        return candidates
