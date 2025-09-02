export const en = {
  common: {
    app_title: 'Flat Earth Safety', resume: 'Resume', start: 'Start', next: 'Next', back: 'Back', submit: 'Submit', save: 'Save', cancel: 'Cancel', copy_link: 'Copy link', open_pdf: 'Open PDF', view_qr: 'QR', locked: 'Locked', unlocked: 'Unlocked', pass: 'Pass', fail: 'Fail', try_again: 'Try again', loading: 'Loading…'
  },
  training: {
    hub_title: 'Your Training', modules_complete_to_unlock_exam: 'Complete all modules to unlock the exam.', final_exam: 'Final Exam', pass_to_generate_cert: 'Pass to generate your certificate', progress_label: 'Progress', module: 'Module', demo: 'Demo', quiz: 'Quiz', minutes: 'min', resume_training: 'Resume training', continue: 'Continue', start_module: 'Start module'
  },
  exam: {
    title: 'Final Exam', results_title: 'Final Exam — Results', passed_title: 'Passed', failed_title: 'Try again', review_incorrect: 'Review incorrect answers', score_label: 'Score', retake_exam: 'Retake exam', view_records: 'View records',
    time_remaining: 'Time remaining',
    continue_saved_exam: 'Continue saved exam',
    start_new_exam: 'Start new exam',
    exam_in_progress: 'You have an exam in progress.',
    auto_saved: 'Auto-saved',
    paused: 'Paused',
    resume: 'Resume',
    submit_now: 'Submit now',
    time_up: 'Time is up. Submitting your answers…'
  },
  certificate: {
    title: 'Certification',
    view_pdf: 'View PDF',
    download_pdf: 'Download PDF',
    copy_link: 'Copy verify link',
    copied: 'Copied',
    verify_id: 'Verification ID',
    issued: 'Issued',
    expires: 'Expires',
    course: 'Course',
    trainee: 'Trainee',
    trainer: 'Trainer',
    status_valid: 'Valid',
    status_expired: 'Expired',
    add_wallet_apple: 'Add to Apple Wallet',
    add_wallet_google: 'Save to Google Wallet',
    coming_soon: 'Coming soon',
    brand: 'Flat Earth Safety',
    footer_note: 'Keep this certificate with your employer records per OSHA §1910.178(l).',
    qr_hint: 'Scan to verify'
  },
  records: {
    title: 'Records & Certificates', verification: 'Verification', exam_col: 'Exam', attempts: 'attempts', certificate_downloaded: 'Certificate downloaded', no_records: 'No records yet'
  },
  verify: {
    title: 'Certificate Verification',
    not_found: 'Certificate not found',
    found: 'Certificate is valid',
    code_label: 'Verification ID',
    view_pdf: 'View PDF',
    trainee: 'Trainee',
    course: 'Course',
    issued: 'Issued',
    expires: 'Expires',
    employer_notice: 'Employers: retain practical evaluation with this record (§1910.178(l)(6)).',
    page_title: 'Certificate Verification', learner: 'Learner', practical: 'Practical', verification_code: 'Verification code', certificate_not_found: 'Certificate not found.'
  },
  eval: {
    title: 'Practical Evaluation', competencies: 'Competencies (OSHA 1910.178(l))', result: 'Result', pass_label: 'Pass', needs_refresher: 'Needs refresher', undecided: 'Undecided', evaluator_name: 'Evaluator name', evaluator_title: 'Evaluator title', site: 'Site/location', date: 'Date', notes: 'Notes', evaluator_signature: 'Evaluator signature', trainee_signature: 'Trainee signature', save_evaluation: 'Save evaluation', save_signature: 'Save signature', print: 'Print',
    competencies_labels: {
      preop: 'Pre-operation inspection', controls: 'Controls & instruments', travel: 'Safe travel', loadHandling: 'Load handling & stacking', pedestrians: 'Pedestrian safety', ramps: 'Ramps & inclines', stability: 'Stability triangle', refuel: 'Refuel/Charging', shutdown: 'Parking & shutdown'
    }
  },
  trainer: {
    tools_title: 'Trainer Tools', roster: 'Roster', invites: 'Invites', export_csv: 'Export CSV', status_counts: 'Counts'
  },
  games: {
    stability_title: 'Stability Triangle', stability_score: 'Stability score', holding_pass: 'Holding PASS… {s}s', reset: 'Reset', mark_complete: 'Mark Complete',
    load_weight: 'Load weight (lb)', load_center: 'Load center (in)', mast_tilt: 'Mast tilt (°)', speed: 'Speed (mph)',
    hint_weight: 'Keep under rated capacity', hint_lc: 'Closer to mast is more stable', hint_tilt: 'Excessive tilt reduces stability', hint_speed: 'Lower speed near hazards'
  },
  errors: { unauthorized: 'Sign in to continue.', forbidden: 'Access denied.', not_found: 'Not found.' }
} as const;
