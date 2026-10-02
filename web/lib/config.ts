export const site = {
  name: "Real Estate Price Simulator",
  tagline: "Correlation & Multiple Regression, powered by AI",
  subtitle:
    "A maths project on how area, rooms and location drive house prices — interact with the model, chat with the AI assistant, and explore 2,518 real Hyderabad listings.",
  student: "Toganti Pruthvi Raj",
  regNo: "REG-NO", // TODO: fill
  college: "College Name", // TODO: fill
  department: "Department of Mathematics",
  year: "2025-26",
  // ---- Guide (LG) placeholder ----
  guide: {
    name: "Guide Name", // TODO: fill (LG name)
    role: "Project Guide",
    photo: "", // TODO: /team/guide.jpg — drop file in public/team/
  },
  // ---- 5-6 group members: fill names + registration numbers ----
  members: Array.from({ length: 6 }, (_, i) => ({
    name: `Member ${i + 1}`,
    regNo: `REG-NO-${i + 1}`,
    photo: "",
  })),
};

export const llm = {
  // OpenCode Go — OpenAI-compatible. Key stays server-side in .env.local
  baseUrl: process.env.OPENCODE_GO_BASE_URL || "https://opencode.ai/zen/go/v1",
  model: process.env.OPENCODE_GO_MODEL || "deepseek-v4.1-flash",
  apiKey: process.env.OPENCODE_GO_API_KEY || "",
};

export const taxes = {
  // Telangana property purchase costs, approximation used by the simulator.
  stampDutyPct: 4,     // stamp duty (% of price)
  registrationPct: 1,  // registration fee (% of price)
  note: "approx. Telangana rates — adjust these numbers in lib/config.ts",
};
