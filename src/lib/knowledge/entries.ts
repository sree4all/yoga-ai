import type { KnowledgeEntry } from "@/lib/types/intake";

/** Static YTT200-level Hatha/Vinyasa inspired sequences — non-medical wellness copy. */
export const KNOWLEDGE_ENTRIES: Record<string, KnowledgeEntry> = {
  stress_whole_mild: {
    id: "stress_whole_mild",
    title: "Grounding & breath — stress (gentle)",
    sequence: [
      {
        poseId: "easy_seated",
        durationSeconds: 120,
        cues: [
          "Sit comfortably; lengthen the spine gently.",
          "Soften shoulders; breathe through the nose.",
        ],
      },
      {
        poseId: "cat_cow",
        durationSeconds: 180,
        cues: [
          "Hands under shoulders, knees under hips.",
          "Move slowly between arch and round with breath.",
        ],
      },
      {
        poseId: "childs_pose",
        durationSeconds: 120,
        cues: ["Knees wide if comfortable; rest forehead or cheek on mat."],
      },
      {
        poseId: "supine_twist",
        durationSeconds: 120,
        cues: [
          "Knees toward chest, then drop to one side with control.",
          "Repeat other side.",
        ],
      },
      {
        poseId: "savasana",
        durationSeconds: 120,
        cues: ["Lie down; allow natural breath; no forcing depth."],
      },
    ],
    posesToAvoid: ["headstand", "shoulder_stand", "plow", "wheel", "deep_backbend"],
    breathingFallback: {
      steps: [
        { instruction: "Sit or lie comfortably. Inhale 4 counts, exhale 6 counts.", durationSeconds: 120 },
        { instruction: "Soften jaw and shoulders; continue easy breath.", durationSeconds: 120 },
        { instruction: "Rest quietly; notice breath without changing it.", durationSeconds: 120 },
      ],
    },
  },
  neck_tension_mild: {
    id: "neck_tension_mild",
    title: "Neck & shoulder ease — gentle mobility",
    sequence: [
      {
        poseId: "seated_neck_stretch",
        durationSeconds: 120,
        cues: [
          "Slow side-to-side and ear-to-shoulder movements without forcing.",
        ],
      },
      {
        poseId: "shoulder_rolls",
        durationSeconds: 120,
        cues: ["Circle shoulders smoothly; keep face soft."],
      },
      {
        poseId: "thread_the_needle",
        durationSeconds: 180,
        cues: [
          "From hands and knees, thread one arm under the other for a mild twist.",
          "Switch sides.",
        ],
      },
      {
        poseId: "supported_fish_prep",
        durationSeconds: 120,
        cues: [
          "Lie on back with small cushion under upper back if available — gentle chest opener.",
        ],
      },
      {
        poseId: "savasana",
        durationSeconds: 120,
        cues: ["Neutral neck; small pillow under head if needed."],
      },
    ],
    posesToAvoid: [
      "headstand",
      "shoulder_stand",
      "plow",
      "full_wheel",
      "deep_forward_fold_weight_on_neck",
    ],
    breathingFallback: {
      steps: [
        { instruction: "Easy seated or lying; breathe in 4, out 6 with relaxed neck.", durationSeconds: 120 },
        { instruction: "Place hands on ribs; feel side ribs expand gently.", durationSeconds: 120 },
        { instruction: "Rest; avoid sharp head movements.", durationSeconds: 120 },
      ],
    },
  },
};
