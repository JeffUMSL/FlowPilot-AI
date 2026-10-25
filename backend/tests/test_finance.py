import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from finance import overview, expense_scenario, income_drop_scenario, dollars_to_cents


class FinanceTests(unittest.TestCase):
    def test_demo_figures(self):
        d = overview()
        self.assertEqual(d['checking_cents'], 120_000)
        self.assertEqual(d['savings_cents'], 350_000)
        self.assertEqual(d['income_cents'], 320_000)
        self.assertEqual(d['expenses_cents'], 290_000)
        self.assertEqual(d['surplus_cents'], 30_000)
        self.assertEqual(d['projected_checking_cents'], 150_000)

    def test_repair_expense(self):
        d = expense_scenario(1300)
        self.assertEqual(d['projected_checking_cents'], 20_000)
        self.assertEqual(d['shortfall_to_buffer_cents'], 30_000)
        self.assertTrue(d['below_buffer'])

    def test_small_expense(self):
        d = expense_scenario(500)
        self.assertEqual(d['projected_checking_cents'], 100_000)
        self.assertFalse(d['below_buffer'])

    def test_income_drop(self):
        d = income_drop_scenario(1200)
        self.assertEqual(d['new_income_cents'], 200_000)
        self.assertEqual(d['projected_checking_cents'], 30_000)
        self.assertEqual(d['shortfall_to_buffer_cents'], 20_000)

    def test_bounds(self):
        for invalid in (-1, 50_001, 1.25, True):
            with self.subTest(invalid=invalid), self.assertRaises(ValueError):
                dollars_to_cents(invalid)
        with self.assertRaises(ValueError):
            income_drop_scenario(3500)


if __name__ == '__main__':
    unittest.main()
