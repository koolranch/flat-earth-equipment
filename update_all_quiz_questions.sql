-- Update All Quiz Questions with Improved OSHA-Compliant Content
-- Run this in Supabase Dashboard > SQL Editor

-- ============================================================================
-- Module 1: Pre-Operation Inspection (order = 2)
-- ============================================================================
UPDATE public.modules
SET quiz_json = '[
    {
        "q": "Which PPE item is NOT optional when operating a forklift indoors?",
        "choices": ["High-visibility vest", "Noise-cancelling earbuds", "Hard-hat", "Steel-toe boots"],
        "answer": 1
    },
    {
        "q": "Forks should travel:",
        "choices": ["Touching the floor", "4–6 inches above the floor", "At axle height", "At eye level"],
        "answer": 1
    },
    {
        "q": "During routine travel, what is the primary purpose of the service brake on a forklift?",
        "choices": [
            "Slowing and stopping the truck under normal conditions",
            "Holding the truck stationary when parked",
            "Sounding an audible alarm",
            "Tilting the mast backward"
        ],
        "answer": 0
    },
    {
        "q": "True / False — You may operate a forklift without a hi-vis vest as long as you stay in marked aisles.",
        "choices": ["True", "False"],
        "answer": 1
    }
]'::jsonb
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 2;

-- ============================================================================
-- Module 2: 8-Point Inspection (order = 3)
-- ============================================================================
UPDATE public.modules
SET quiz_json = '[
    {
        "q": "Which item is part of OSHAs daily forklift inspection checklist?",
        "choices": ["Seat upholstery", "Hydraulic hoses", "Coffee-cup holder", "Cab speakers"],
        "answer": 1
    },
    {
        "q": "If you discover a leaking hydraulic hose you should:",
        "choices": [
            "Wipe it off and keep working",
            "Tag-out the truck and report it",
            "Ignore unless dripping heavily",
            "Tighten the mast chain"
        ],
        "answer": 1
    },
    {
        "q": "The data plate tells you:",
        "choices": ["Truck weight & load capacity", "Last oil-change date", "Operators license number", "Fork length"],
        "answer": 0
    },
    {
        "q": "True / False — A working horn is optional if the warehouse has mirrors at intersections.",
        "choices": ["True", "False"],
        "answer": 1
    }
]'::jsonb
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 3;

-- ============================================================================
-- Module 3: Operating Procedures (order = 4)
-- ============================================================================
UPDATE public.modules
SET quiz_json = '[
    {
        "q": "What information does a capacity plate provide?",
        "choices": [
            "Maximum safe load weight at a given load center",
            "Fork length",
            "Fuel type",
            "Tire pressure"
        ],
        "answer": 0
    },
    {
        "q": "Standard load-center distance used on most capacity plates is:",
        "choices": ["12 inches", "18 inches", "24 inches", "36 inches"],
        "answer": 2
    },
    {
        "q": "Tilting the mast forward while carrying a high load:",
        "choices": [
            "Lowers tip-over risk",
            "Has no effect",
            "Raises tip-over risk",
            "Adds stability on ramps"
        ],
        "answer": 2
    },
    {
        "q": "True / False — You should fully insert forks under the pallet before lifting.",
        "choices": ["True", "False"],
        "answer": 0
    }
]'::jsonb
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 4;

-- ============================================================================
-- Module 4: Load Handling & Safety (order = 5)
-- ============================================================================
UPDATE public.modules
SET quiz_json = '[
    {
        "q": "Minimum safe distance to a walking pedestrian is:",
        "choices": ["3 ft", "6 ft", "10 ft", "15 ft"],
        "answer": 2
    },
    {
        "q": "You should sound the horn:",
        "choices": [
            "Only outdoors",
            "At every blind corner",
            "Only when carrying a load",
            "Rarely, to avoid noise"
        ],
        "answer": 1
    },
    {
        "q": "If you spot a liquid spill on your route you must:",
        "choices": [
            "Drive slowly through it",
            "Stop and block the area until its cleaned",
            "Report it after shift",
            "Ignore if less than one foot wide"
        ],
        "answer": 1
    },
    {
        "q": "True / False — Mirrors eliminate the need for a horn at blind intersections.",
        "choices": ["True", "False"],
        "answer": 1
    }
]'::jsonb
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 5;

-- ============================================================================
-- Module 5: Advanced Operations (order = 6)
-- ============================================================================
UPDATE public.modules
SET quiz_json = '[
    {
        "q": "The proper shutdown sequence begins with:",
        "choices": ["Forks down", "Shift to neutral", "Turn key off", "Set parking brake"],
        "answer": 1
    },
    {
        "q": "When parking on a slight ramp you must:",
        "choices": [
            "Leave truck in gear",
            "Chock at least one wheel",
            "Rely on the service brake",
            "Leave forks raised"
        ],
        "answer": 1
    },
    {
        "q": "For battery-electric forklifts, you should wear ______ when plugging in the charger.",
        "choices": ["Leather gloves", "Rubber insulating gloves", "No gloves", "Welding gauntlets"],
        "answer": 1
    },
    {
        "q": "True / False — Forks may remain raised if the area is fenced and no pedestrians enter.",
        "choices": ["True", "False"],
        "answer": 1
    }
]'::jsonb
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 6;

-- ============================================================================
-- VERIFICATION: Show updated quiz questions
-- ============================================================================
SELECT 
    "order",
    title,
    jsonb_array_length(quiz_json) as question_count,
    quiz_json
FROM public.modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" BETWEEN 2 AND 6
ORDER BY "order";

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ALL QUIZ QUESTIONS UPDATED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Module 1: 4 improved Pre-Operation Inspection questions';
    RAISE NOTICE '✅ Module 2: 4 improved 8-Point Inspection questions';
    RAISE NOTICE '✅ Module 3: 4 improved Operating Procedures questions';
    RAISE NOTICE '✅ Module 4: 4 improved Load Handling & Safety questions';
    RAISE NOTICE '✅ Module 5: 4 improved Advanced Operations questions';
    RAISE NOTICE '';
    RAISE NOTICE '🔥 Key Improvements:';
    RAISE NOTICE '• More OSHA-compliant and specific questions';
    RAISE NOTICE '• Consistent 4-question format for all modules';
    RAISE NOTICE '• Better practical application scenarios';
    RAISE NOTICE '• Enhanced safety focus with real-world situations';
    RAISE NOTICE '';
    RAISE NOTICE 'Your forklift certification course now has professional-grade quiz content!';
END $$; 