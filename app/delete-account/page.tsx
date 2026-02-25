export const metadata = {
  title: 'Delete Your Account | Flat Earth Equipment',
  description:
    'Request full deletion of your Forklift Certified account and associated data.',
}

export default function DeleteAccountPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1>Delete Your Account</h1>
      <p className="lead">Forklift Certified — Training App</p>

      <p>
        You can request full deletion of your account and all associated data at
        any time. Once processed, this action cannot be undone.
      </p>

      <h2>How to Request Deletion</h2>
      <ol>
        <li>Open the Flat Earth Safety app</li>
        <li>Go to the <strong>Profile</strong> tab</li>
        <li>
          Tap <strong>&ldquo;Delete Account&rdquo;</strong> at the bottom of the
          settings
        </li>
        <li>Confirm deletion when prompted</li>
      </ol>

      <p>
        Or email{' '}
        <a href="mailto:support@flatearthequipment.com">
          support@flatearthequipment.com
        </a>{' '}
        with the subject <strong>&ldquo;Account Deletion Request&rdquo;</strong>{' '}
        and include the email address associated with your account.
      </p>

      <h2>Data That Will Be Deleted</h2>
      <ul>
        <li>Account credentials and profile information</li>
        <li>Training progress and quiz scores</li>
        <li>XP, streaks, and achievements</li>
        <li>Certification exam results</li>
        <li>Push notification tokens</li>
      </ul>

      <h2>Data That May Be Retained</h2>
      <ul>
        <li>
          Certification records may be retained for up to 3 years for OSHA
          compliance purposes (required by 29 CFR 1910.178)
        </li>
        <li>
          Payment transaction records may be retained as required by law
        </li>
      </ul>

      <h2>Timeline</h2>
      <p>Account deletion requests are processed within 30 days.</p>

      <h2>Contact Us</h2>
      <p>
        If you have questions about account deletion or your data, reach out
        at{' '}
        <a href="mailto:support@flatearthequipment.com">
          support@flatearthequipment.com
        </a>
        .
      </p>
    </main>
  )
}
