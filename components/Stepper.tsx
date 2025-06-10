import { StepForward, BookOpen, Gamepad2, ClipboardList } from 'lucide-react'

export function Stepper({ current }: { current: 'guide' | 'video' | 'game' | 'quiz' }) {
  const steps = [
    { id: 'guide',  label: 'Guide',  icon: BookOpen },
    { id: 'video',  label: 'Watch',  icon: StepForward },
    { id: 'game',   label: 'Practice', icon: Gamepad2 },
    { id: 'quiz',   label: 'Quiz',   icon: ClipboardList }
  ] as const

  return (
    <ol className="mb-4 flex justify-between text-xs sm:text-sm">
      {steps.map(({ id, label, icon: Icon }) => (
        <li key={id} className="flex-1 text-center">
          <div
            className={
              id === current
                ? 'flex flex-col items-center text-orange-600'
                : 'flex flex-col items-center text-gray-400'
            }
          >
            <Icon className="h-5 w-5 mb-1" />
            {label}
          </div>
        </li>
      ))}
    </ol>
  )
} 