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

  hips_mobility_mild: {
    id: "hips_mobility_mild",
    title: "Hips — gentle mobility & space",
    sequence: [
      {
        poseId: "supine_hip_circles",
        durationSeconds: 120,
        cues: [
          "On your back, knees bent; draw slow circles with knees together.",
          "Keep ribs soft; smaller range if needed.",
        ],
      },
      {
        poseId: "figure_four_lying",
        durationSeconds: 180,
        cues: [
          "Ankle over opposite knee; gently guide thigh toward you.",
          "Switch sides.",
        ],
      },
      {
        poseId: "low_lunge_gentle",
        durationSeconds: 120,
        cues: [
          "Hands on blocks or floor; back knee down if available.",
          "Lift chest lightly; switch sides.",
        ],
      },
      {
        poseId: "wide_knees_childs",
        durationSeconds: 120,
        cues: ["Knees wide, big toes together; rest forward if comfortable."],
      },
      {
        poseId: "savasana",
        durationSeconds: 120,
        cues: ["Legs long; let hips settle heavy."],
      },
    ],
    posesToAvoid: [
      "deep_pigeon_force",
      "full_splits",
      "headstand",
      "extreme_external_rotation",
    ],
    breathingFallback: {
      steps: [
        { instruction: "Lie on back; inhale 4, exhale 6 with relaxed belly.", durationSeconds: 120 },
        { instruction: "Notice hip weight on the floor without gripping.", durationSeconds: 120 },
        { instruction: "Rest; avoid sharp pinching in the groin.", durationSeconds: 120 },
      ],
    },
  },

  back_care_mild: {
    id: "back_care_mild",
    title: "Spine care — slow & supported",
    sequence: [
      {
        poseId: "cat_cow",
        durationSeconds: 180,
        cues: [
          "Hands under shoulders, knees under hips.",
          "Small, smooth waves; no forcing end range.",
        ],
      },
      {
        poseId: "bird_dog",
        durationSeconds: 120,
        cues: [
          "Extend opposite arm and leg with a long spine.",
          "Switch sides slowly.",
        ],
      },
      {
        poseId: "sphinx_or_cobra_prep",
        durationSeconds: 120,
        cues: [
          "Forearms or hands under shoulders; lift chest a little.",
          "Keep lower ribs soft; breathe wide.",
        ],
      },
      {
        poseId: "childs_pose",
        durationSeconds: 120,
        cues: ["Arms alongside or forward; breathe into the back body."],
      },
      {
        poseId: "knees_to_chest",
        durationSeconds: 120,
        cues: ["Gently hug knees in; head rests down."],
      },
      {
        poseId: "savasana",
        durationSeconds: 120,
        cues: ["Optional small support under knees for low-back ease."],
      },
    ],
    posesToAvoid: [
      "full_wheel",
      "deep_forward_fold_rounding",
      "headstand",
      "forceful_twists",
    ],
    breathingFallback: {
      steps: [
        { instruction: "Lie on back; slow nasal breath, ribs wide.", durationSeconds: 120 },
        { instruction: "On exhale, imagine length through the spine.", durationSeconds: 120 },
        { instruction: "Rest; avoid sharp pinching in the low back.", durationSeconds: 120 },
      ],
    },
  },

  stiffness_slow_mild: {
    id: "stiffness_slow_mild",
    title: "Ease stiffness — slow & steady",
    sequence: [
      {
        poseId: "easy_seated_side_bend",
        durationSeconds: 120,
        cues: [
          "Sit tall; reach one arm overhead to a gentle side stretch.",
          "Switch sides.",
        ],
      },
      {
        poseId: "seated_spinal_twist_mild",
        durationSeconds: 120,
        cues: [
          "One hand behind, other on knee; rotate gently.",
          "Switch sides.",
        ],
      },
      {
        poseId: "sun_salutation_modified",
        durationSeconds: 240,
        cues: [
          "Slow flow: reach up, fold halfway, step back to low kneel.",
          "Repeat a few rounds at half pace.",
        ],
      },
      {
        poseId: "standing_forward_fold_soft",
        durationSeconds: 120,
        cues: ["Knees soft; let head hang heavy; hold elbows if helpful."],
      },
      {
        poseId: "supine_twist",
        durationSeconds: 120,
        cues: ["Knees toward chest, drop to one side; switch."],
      },
      {
        poseId: "savasana",
        durationSeconds: 120,
        cues: ["Whole body soft; no rushing to sit up."],
      },
    ],
    posesToAvoid: [
      "forceful_bind",
      "deep_lunge_jump",
      "headstand",
      "cold_static_split",
    ],
    breathingFallback: {
      steps: [
        { instruction: "Easy breath in 4, longer exhale 6 — smooth, not strained.", durationSeconds: 120 },
        { instruction: "Soften jaw; let shoulders drop away from ears.", durationSeconds: 120 },
        { instruction: "Rest; small movements beat big pushes.", durationSeconds: 120 },
      ],
    },
  },

  fatigue_gentle_flow_mild: {
    id: "fatigue_gentle_flow_mild",
    title: "Gentle energy — light movement",
    sequence: [
      {
        poseId: "standing_breath_arms",
        durationSeconds: 120,
        cues: [
          "Stand with soft knees; inhale arms wide, exhale arms down.",
          "Repeat slowly.",
        ],
      },
      {
        poseId: "warrior_one_gentle",
        durationSeconds: 120,
        cues: [
          "Short stance; back heel lifted if needed.",
          "Arms up only if shoulders allow; switch sides.",
        ],
      },
      {
        poseId: "wide_leg_forward_fold_soft",
        durationSeconds: 120,
        cues: ["Feet wide; hands on blocks; long spine."],
      },
      {
        poseId: "bridge_gentle",
        durationSeconds: 120,
        cues: ["Feet hip-width; lift hips a little; no clenching."],
      },
      {
        poseId: "legs_up_wall_or_bolster",
        durationSeconds: 120,
        cues: ["Hips near wall or calves on chair; rest arms open."],
      },
      {
        poseId: "savasana",
        durationSeconds: 120,
        cues: ["Let breath return to natural rhythm."],
      },
    ],
    posesToAvoid: [
      "headstand",
      "long_hold_plank",
      "rapid_vinyasa",
      "full_wheel",
    ],
    breathingFallback: {
      steps: [
        { instruction: "Lie down; inhale gentle, exhale longer without strain.", durationSeconds: 120 },
        { instruction: "Notice contact points with the floor; soften.", durationSeconds: 120 },
        { instruction: "Rest; favor ease over effort.", durationSeconds: 120 },
      ],
    },
  },
};
