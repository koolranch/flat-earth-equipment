# MEWP Certification Course: Technical Design Document
## ANSI A92 Compliance (Scissor & Aerial Lifts)

This document outlines the curriculum, data structure, and logic flow for the Mobile Elevating Work Platform (MEWP) certification course, designed to fit within the existing training platform.

---

## 1. The Module Architecture (The "Flow")

The course is structured into four critical ANSI-required sections to ensure compliance with OSHA 1926.453 and ANSI A92.22 / A92.24.

### Module 1: Definitions & Classifications
*   **Goal:** Establish the fundamental distinction between MEWP groups and types.
*   **Key Content:**
    *   **Group A:** MEWPs where the vertical projection of the center of the platform area is always inside the tipping lines (e.g., Scissor Lifts, Vertical Mast Lifts).
    *   **Group B:** MEWPs where the vertical projection of the center of the platform area can be outside the tipping lines (e.g., Boom Lifts).
    *   **Types (1, 2, 3):** Based on travel capabilities (Static, Controlled from Chassis, Controlled from Platform).
    *   **The Distinction:** Why "Group" matters—certification must specify the group an operator is trained on to be valid under A92.24.

### Module 2: MEWP Specific Hazards
*   **Goal:** Identify life-threatening risks unique to aerial work.
*   **Key Content:**
    *   **Electrocution:** Minimum Approach Distances (MAD) and the "Look Up and Live" rule.
    *   **Tip-overs:** Wind speed limits, ground conditions, and slope ratings.
    *   **Crush Points:** Entrapment between the platform and overhead obstructions (Joists, Beams, Ductwork).
    *   **Ejection:** The "Catapult Effect" in Boom Lifts when hitting a curb or pothole.

### Module 3: Fall Protection Requirements
*   **Goal:** Clarify the "Fall Restraint" vs "Fall Arrest" confusion.
*   **Key Content:**
    *   **Fall Restraint:** Prevents the user from reaching a fall hazard (Standard for Scissor Lifts if guards are not sufficient or local policy requires).
    *   **Fall Arrest:** Stops a fall in progress (Required for all Group B / Boom Lifts).
    *   **Lanyard Selection:** Why a 6ft shock-absorbing lanyard is often the *wrong* choice for low-level MEWP work (Total Fall Distance vs Platform Height).

### Module 4: The Rescue Plan
*   **Goal:** Satisfy the new ANSI A92.22 requirement for a written rescue plan.
*   **Key Content:**
    *   **Pre-Task Planning:** No operator goes up without a designated "Ground Person" trained in emergency lowering.
    *   **Self-Rescue vs. Assisted Rescue:** Using platform controls (if functional) vs. ground emergency overrides.
    *   **Suspension Trauma:** The 15-minute window to rescue a fallen worker before permanent injury occurs.

---

## 2. Quiz Data Structure (JSON Format)

The following JSON array represents 5 distinct quiz questions (one per module) designed for integration into the `quiz_json` field.

```json
[
  {
    "question_text": "Under ANSI A92, a Scissor Lift is classified as which of the following?",
    "options": [
      "Group A, Type 3",
      "Group B, Type 1",
      "Class IV Industrial Truck",
      "Group B, Type 3"
    ],
    "correct_answer_index": 0,
    "failure_explanation": "Scissor lifts are Group A (vertical movement) and Type 3 (can be driven from the platform). Group B is for Boom lifts."
  },
  {
    "question_text": "What is the primary cause of 'Crush Point' fatalities in MEWPs?",
    "options": [
      "Falling out of the bucket",
      "Entrapment between the platform and an overhead structure",
      "Battery explosions during charging",
      "Driving off a loading dock"
    ],
    "correct_answer_index": 1,
    "failure_explanation": "Crush points occur when the operator is caught between the lift and a ceiling, beam, or pipe. This is a leading cause of MEWP fatalities."
  },
  {
    "question_text": "True or False: A personal fall arrest system (PFAS) is required at all times when operating a Boom Lift (Group B).",
    "options": [
      "True",
      "False"
    ],
    "correct_answer_index": 0,
    "failure_explanation": "OSHA and ANSI require full fall protection (Harness + Lanyard) for all Boom-supported platforms. Scissor lifts only require guardrails unless site-specific rules differ."
  },
  {
    "question_text": "According to the new ANSI A92 standards, when must a Rescue Plan be established?",
    "options": [
      "Only after an accident occurs",
      "Only for work above 60 feet",
      "Before any MEWP operation begins",
      "Only if the ground is uneven"
    ],
    "correct_answer_index": 2,
    "failure_explanation": "ANSI A92.22 requires a written rescue plan for all MEWP operations to ensure a worker can be lowered safely if the machine fails or a fall occurs."
  },
  {
    "question_text": "What is the function of the 'Pothole Guards' on a Scissor Lift?",
    "options": [
      "To keep the wheels from getting dirty",
      "To reduce ground clearance and prevent a tip-over if a wheel hits a hole",
      "To provide a step for the operator to climb in",
      "To hold the hydraulic fluid reservoir"
    ],
    "correct_answer_index": 1,
    "failure_explanation": "Pothole guards deploy automatically when the platform is raised to limit the tilt of the machine if it encounters a depression in the floor."
  }
]
```

---

## 3. Practical Evaluation "Hand-Off" Logic

### The UI Step
Upon passing the final online exam, the system will trigger a **"Practical Evaluation Required"** modal.
1.  **Block Issuance:** The final "Full Certification" is marked as *Pending* until the employer/trainer uploads the checklist.
2.  **Download Prompt:** User is presented with a button: `[Download MEWP Operator Practical Evaluation Checklist]`.
3.  **Instructor Instructions:** "This document must be signed by a qualified evaluator after a hands-on demonstration of the skills listed below."

### Scissor Lift Walk-Around Checklist (A92.24 Specific)
The checklist must include these specific items that distinguish MEWPs from forklifts:
*   [ ] **Pothole Guards:** Verify metal flaps deploy when platform is raised ~2 feet and retract when lowered.
*   [ ] **Tilt Sensor:** Test the tilt alarm by raising the platform slightly on a known slope (within limits).
*   [ ] **Emergency Lowering:** Demonstrate use of the manual bleed valve or base emergency switch.
*   [ ] **Platform Entrance:** Ensure the gate/chain self-closes and latches.
*   [ ] **Joystick "Dead-Man":** Verify the trigger/interlock must be engaged before any movement occurs.
*   [ ] **Guardrail Integrity:** Check for welds, cracks, and that all pins are secured.

---

## 4. Certificate Generation Specs

To be compliant with **ANSI A92.24**, the generated PDF must include the following metadata:

### Required Compliance Text
*   "This operator has successfully completed formal training in accordance with **ANSI A92.24-2018** and **OSHA 1926.453**."
*   "Training covers the Safe Use and Operation of Mobile Elevating Work Platforms (MEWPs)."

### Group & Type Distinction
The certificate must explicitly list the Equipment Categories covered. It should NOT just say "Aerial Lift."
*   **Format:**
    *   [X] **Group A, Type 3** (Scissor Lifts, Vertical Mast)
    *   [X] **Group B, Type 3** (Boom Lifts, Cherry Pickers)
*   *Note: If a user only completes one, the other should be unchecked or omitted to prevent unauthorized operation.*

### QR Verification Code
*   Must link to a public verification page (e.g., `/verify/[CODE]`) to allow safety managers to confirm the training is active and not expired (3-year validity recommended).

