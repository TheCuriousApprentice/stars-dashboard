import { render, screen } from "@testing-library/react";
import { StarsDashboard } from "./stars-dashboard";

jest.mock("@/hooks/use-stars-scores", () => ({
  useStarsScores: () => ({
    scores: {
      security: 5,
      testing: 6,
      accessibility: 4,
      reliability: 5,
      scalability: 4
    }
  })
}));

describe("StarsDashboard", () => {
  it("renders the readiness heading and summary", () => {
    render(<StarsDashboard />);

    expect(screen.getByText(/S\.T\.A\.R\.S FRAMEWORK READINESS/i)).toBeInTheDocument();
    expect(screen.getByText(/Overall score/i)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Readiness/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Implementation/i })).toBeInTheDocument();
  });
});
