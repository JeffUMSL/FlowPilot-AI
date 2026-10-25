import Assistant from "../../../components/Assistant";

// Public, read-only calculator. Does not contact private API endpoints.
export default function DemoAssistantPage() {
  return <Assistant demoOnly />;
}
