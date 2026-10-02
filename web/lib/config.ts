export const site = {
  name: "Real Estate Price Simulator",
  tagline: "Correlation & Multiple Regression, powered by AI",
  subtitle:
    "A maths project on how area, rooms and location drive house prices — interact with the model, chat with the AI assistant, and explore 2,518 real Hyderabad listings.",
  student: "Pruthvi Raj",
  regNo: "4157",
  college: "College Name", // TODO: fill
  department: "Department of Mathematics",
  year: "2025-26",
  className: "206",
  // ---- Guide (LG) ----
  guide: {
    name: "LG No. 11",
    role: "Project Guide",
    photo: "", // TODO: /team/guide.jpg — drop file in public/team/
  },
  // ---- Group members ----
  members: [
    { name: "Bhairavesh", regNo: "4160", photo: "" },
    { name: "Irfan", regNo: "4161", photo: "" },
    { name: "Rahul", regNo: "4169", photo: "" },
    { name: "Krishna", regNo: "4165", photo: "" },
    { name: "Pruthvi Raj", regNo: "4157", photo: "" },
  ],
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
