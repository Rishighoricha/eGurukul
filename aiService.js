const API_KEY = "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";
const TARGET_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const API_URL = "https://corsproxy.io/?" + encodeURIComponent(TARGET_URL);

/**
 * Ask GurukulBot a question with student dataset awareness
 */
export async function askEduBot(userMessage, chatHistory = [], contextData = {}) {
  const { totalStudents = 0, defaulters = [], averageAttendance = 0 } = contextData;

  const defaulterNames = defaulters.length > 0
    ? defaulters.map(d => `${d.name} (${d.attendance}%)`).join(', ')
    : 'None';

  const systemPrompt = `You are GurukulBot, the intelligent academic advisor embedded into eGurukul (built by Rishi and Aditya — Aditya Ghosh Roll no 14, Rishi Ghoricha Roll no 13, SAKEC Sem III).
eGurukul monitors student attendance, flags academic risk (<75% threshold), and aligns with UN SDG 4 (Quality Education) and SDG 10 (Reduced Inequalities).

Current Live System Data:
- Total Enrolled Students: ${totalStudents}
- Overall Class Average: ${averageAttendance}%
- Defaulters (<75% attendance): ${defaulters.length} students (${defaulterNames})

Key Features & Navigation in eGurukul:
- Dashboard: Overview of metrics, real-time critical tickers, and risk doughnut chart.
- Students: Master roster, PRN management, subject lecture editing, and official PDF warning letter generator.
- Pipeline: Kanban counseling workflow board (High Risk -> Active Monitoring -> Resolved) with personalized AI recovery plans.
- Subjects: SAKEC Sem-III 10 course loads breakdown with attendance bar chart and credit tracking.
- Analytics: Class-wide subject difficulty index and defaulter patterns.
- SDG Hub: UN SDG 4 and SDG 10 benchmark alignments.

Respond concisely, accurately, helpfully, and with a polite academic advisor persona. Keep answers under 4-5 sentences unless asked for an in-depth breakdown.`;

  const messagesPayload = [
    { role: "system", content: systemPrompt },
    ...chatHistory.slice(-6).map(m => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage }
  ];

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        temperature: 0.3,
        messages: messagesPayload,
        max_tokens: 280
      })
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }
    throw new Error(data.error?.message || "Invalid API response structure");
  } catch (error) {
    console.warn("NVIDIA API failed, using intelligent local advisor fallback:", error);
    // Intelligent local fallback so user never gets stuck
    const query = userMessage.toLowerCase();
    if (query.includes("defaulter") || query.includes("risk") || query.includes("low")) {
      return `Currently, there are ${defaulters.length} student(s) below the 75% attendance threshold: ${defaulterNames}. Consider generating official 7-day warning notices or moving them into the counseling Pipeline.`;
    }
    if (query.includes("sdg") || query.includes("sustainability") || query.includes("goal")) {
      return "eGurukul directly targets SDG 4 (Quality Education) by preventing course failure through proactive tracking, and SDG 10 (Reduced Inequalities) by ensuring vulnerable students receive timely counseling support.";
    }
    if (query.includes("subject") || query.includes("sakec") || query.includes("sem")) {
      return "eGurukul tracks all 10 courses in SAKEC Semester III, including Core Theory (Discrete Structure, OS, DS, Microprocessor, Embedded Systems) and Applied Labs. You can view student standing directly on the Subjects page!";
    }
    return `eGurukul Assistant: System is actively monitoring ${totalStudents} students with an average attendance of ${averageAttendance}%. Please check the Students or Pipeline module to take immediate intervention actions.`;
  }
}

/**
 * Generate a 1-sentence personalized intervention strategy for the Pipeline
 */
export async function generateInterventionStrategy(studentName, attendance, subjectWeaknesses = []) {
  try {
    const weaknessesText = subjectWeaknesses.length > 0 ? ` Lowest in: ${subjectWeaknesses.join(', ')}.` : '';
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        temperature: 0.2,
        max_tokens: 60,
        messages: [
          { role: "system", content: "You are an academic mentor. Give a strict 1-sentence actionable personalized recovery strategy for a student with attendance deficit." },
          { role: "user", content: `Student ${studentName} has ${attendance}% overall attendance.${weaknessesText} Recommend an exact counseling action.` }
        ]
      })
    });
    const data = await res.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    }
    throw new Error("Empty response");
  } catch (err) {
    if (attendance < 60) {
      return `Immediate parent-teacher conference required with mandatory remedial lecture schedule for ${studentName}.`;
    } else if (attendance < 75) {
      return `Assign peer mentor and require signed attendance log for the next 15 consecutive working days for ${studentName}.`;
    }
    return `Maintain current attendance pace and schedule bi-weekly check-in with faculty counselor.`;
  }
}
