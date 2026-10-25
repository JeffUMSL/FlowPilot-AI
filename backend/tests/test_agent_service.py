import sys
import types
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import agent_service as service


class MoneyAnswerTests(unittest.TestCase):
    def test_overview_surplus_and_largest(self):
        self.assertIn('surplus of $300', service.overview_answer('What is my monthly surplus?'))
        self.assertIn('Rent at $1,350', service.overview_answer('What is the largest spending category?'))

    def test_custom_surplus(self):
        a = service.custom_surplus_answer(2000, 3000)
        self.assertIn('$1,000', a)
        self.assertIn('deficit', a)
        self.assertNotIn('$100,000', a)

    def test_expense_scenario(self):
        a = service.expense_answer(1300)
        self.assertIn('to $200', a)
        self.assertIn('$300 below', a)

    def test_income_drop_scenario(self):
        a = service.income_drop_answer(1200)
        self.assertIn('income to $2,000', a)
        self.assertIn('checking to $300', a)
        self.assertIn('$200 below', a)

    def test_dollars_exact(self):
        self.assertEqual(service.usd(1), '$0.01')
        self.assertEqual(service.usd(10000000), '$100,000')
        self.assertEqual(service.usd(-301), '-$3.01')

    def test_follow_up_two_values_needs_history(self):
        question = '$2000 and $3000'
        preceding = [{'role': 'assistant', 'text': 'What is your monthly income and total monthly expenses?'}]
        self.assertEqual(service.detect_user_income_and_expenses(question, preceding), (2000, 3000))
        self.assertIsNone(service.detect_user_income_and_expenses(question, []))

    def test_explicit_values_and_context(self):
        text = 'My income is $2000 and my expenses are $3000'
        self.assertEqual(service.detect_user_income_and_expenses(text, []), (2000, 3000))

    def test_invalid_custom_input(self):
        with self.assertRaises(ValueError):
            service.custom_surplus_answer(2000, 100001)


class AgentReplyTests(unittest.TestCase):
    @staticmethod
    def fake_strands(call_tool=True):
        sdk = types.ModuleType('strands')
        sdk.__path__ = []
        sdk.tool = lambda fn: fn

        class FakeAgent:
            def __init__(self, model, system_prompt, tools):
                self.tools = tools

            def __call__(self, prompt):
                if call_tool:
                    if 'surplus' in prompt.lower() or 'largest' in prompt.lower():
                        self.tools[0]()
                    elif 'repair' in prompt.lower():
                        self.tools[0](1300)
                    elif 'income drops' in prompt.lower():
                        self.tools[0](1200)
                return 'LLM made up $100,000.'

        sdk.Agent = FakeAgent
        models = types.ModuleType('strands.models')
        models.__path__ = []
        ollama = types.ModuleType('strands.models.ollama')
        ollama.OllamaModel = lambda host, model_id: object()
        return {'strands': sdk, 'strands.models': models, 'strands.models.ollama': ollama}

    def test_replaces_hallucinated_model_amount_with_verified_tool_answer(self):
        with patch.dict(sys.modules, self.fake_strands()), patch.object(service, 'provider_status', return_value={'ready': True, 'provider': 'ollama'}):
            actual = service.ask_strands('What is my monthly surplus?')
        self.assertEqual(actual['mode'], 'strands')
        self.assertEqual(actual['tools_used'][0]['tool'], 'get_demo_financial_overview')
        self.assertIn('surplus of $300', actual['answer'])
        self.assertNotIn('$100,000', actual['answer'])

    def test_direct_custom_followup_is_not_misidentified_as_income_drop(self):
        previous = [{'role': 'assistant', 'text': 'What is your total monthly income and total monthly expenses?'}]
        actual = service.ask_strands('$2000 and $3000', previous)
        self.assertEqual(actual['mode'], 'calculation')
        self.assertIn('deficit of $1,000', actual['answer'])
        self.assertEqual(actual['tools_used'], [])

    def test_fallback_does_not_fake_strands_tool(self):
        with patch.dict(sys.modules, self.fake_strands(call_tool=False)), patch.object(service, 'provider_status', return_value={'ready': True, 'provider': 'ollama'}):
            actual = service.ask_strands('What is my monthly surplus?')
        self.assertEqual(actual['mode'], 'calculation')
        self.assertEqual(actual['tools_used'], [])
        self.assertIn('$300', actual['answer'])


if __name__ == '__main__':
    unittest.main()
