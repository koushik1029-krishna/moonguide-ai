import { LIMITATIONS } from "../data/constants.js";
import Card from "./ui/Card.jsx";

export default function LimitationsCard() {
  return (
    <Card title="Responsible AI limitations" titleId="limits-heading">
      <p>
        If an answer is missing, unclear, or about a sale that needs a person, please speak
        with a store employee. Staff and managers can review questions that need a human
        decision. This assistant does not replace legally required identification checks.
      </p>
      <ul className="limit-list">
        {LIMITATIONS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  );
}
