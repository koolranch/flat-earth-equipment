import { getUserAndRole } from '@/lib/auth/roles';

export const dynamic = 'force-dynamic';

export default async function TrainerDashboard() {
  const { user, role } = await getUserAndRole();
  
  return (
    <main className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Trainer Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">Welcome, {user?.email}</p>
        <div className="inline-flex items-center gap-2 mt-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {role?.toUpperCase()}
          </span>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <section className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
          <h2 className="font-semibold mb-2">Student Progress</h2>
          <p className="text-sm text-slate-600">Monitor learner progress and completion rates.</p>
          <div className="mt-3">
            <button className="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg">
              View Progress
            </button>
          </div>
        </section>

        <section className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
          <h2 className="font-semibold mb-2">Evaluations</h2>
          <p className="text-sm text-slate-600">Conduct practical evaluations and assessments.</p>
          <div className="mt-3">
            <button className="text-sm bg-green-600 text-white px-3 py-2 rounded-lg">
              New Evaluation
            </button>
          </div>
        </section>

        <section className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
          <h2 className="font-semibold mb-2">Certificates</h2>
          <p className="text-sm text-slate-600">Issue and manage training certificates.</p>
          <div className="mt-3">
            <button className="text-sm bg-orange-600 text-white px-3 py-2 rounded-lg">
              Manage Certs
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
