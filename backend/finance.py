"""Deterministic read-only financial calculations for fictional demo data.

Amounts are integer cents everywhere; a model never calculates official balances.
"""
import json
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "demo-data.json"


def data() -> dict:
    """Load the same demo JSON that the Next.js dashboard uses."""
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


def overview() -> dict:
    d = data()
    checking = next(a["starting_balance_cents"] for a in d["accounts"] if a["id"] == "checking")
    savings = next(a["starting_balance_cents"] for a in d["accounts"] if a["id"] == "savings")
    income = d["net_monthly_income_cents"]
    expense_items = d["planned_monthly_expenses"]
    expenses = sum(item["amount_cents"] for item in expense_items)
    return {
        "currency": "USD", "profile": d["profile"]["name"],
        "checking_cents": checking, "savings_cents": savings,
        "income_cents": income, "expenses_cents": expenses,
        "surplus_cents": income - expenses,
        "projected_checking_cents": checking + income - expenses,
        "safety_buffer_cents": d["checking_safety_buffer_cents"],
        "categories": [{"name": i["category"], "amount_cents": i["amount_cents"], "optional": i["optional"]} for i in expense_items],
        "basis": "fictional sample data; illustrative monthly totals, not bank records",
    }


def dollars_to_cents(dollars: int) -> int:
    if type(dollars) is not int or not 0 <= dollars <= 50_000:
        raise ValueError("Enter a whole-dollar amount from $0 to $50,000.")
    return dollars * 100


def expense_scenario(expense_dollars: int, safety_buffer_dollars: int = 500) -> dict:
    scenario = overview()
    expense = dollars_to_cents(expense_dollars)
    buffer = dollars_to_cents(safety_buffer_dollars)
    result = scenario["projected_checking_cents"] - expense
    return {
        "type": "one_time_expense", "expense_cents": expense,
        "starting_checking_cents": scenario["checking_cents"],
        "monthly_income_cents": scenario["income_cents"],
        "planned_expenses_cents": scenario["expenses_cents"],
        "baseline_checking_cents": scenario["projected_checking_cents"],
        "projected_checking_cents": result,
        "safety_buffer_cents": buffer,
        "below_buffer": result < buffer,
        "shortfall_to_buffer_cents": max(0, buffer - result),
        "basis": "fictional sample data; assumes all planned income and expenses occur within one month",
    }


def income_drop_scenario(monthly_drop_dollars: int, safety_buffer_dollars: int = 500) -> dict:
    scenario = overview()
    drop = dollars_to_cents(monthly_drop_dollars)
    buffer = dollars_to_cents(safety_buffer_dollars)
    if drop > scenario["income_cents"]:
        raise ValueError("Income drop cannot exceed this demo's $3,200 monthly income.")
    result = scenario["projected_checking_cents"] - drop
    return {
        "type": "income_drop", "income_drop_cents": drop,
        "new_income_cents": scenario["income_cents"] - drop,
        "baseline_checking_cents": scenario["projected_checking_cents"],
        "projected_checking_cents": result,
        "safety_buffer_cents": buffer,
        "below_buffer": result < buffer,
        "shortfall_to_buffer_cents": max(0, buffer - result),
        "basis": "fictional sample data; assumes spending does not change",
    }
