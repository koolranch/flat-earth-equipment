# Legacy progress endpoint

Some older client code posts to `/api/progress/complete-module`. A compatibility shim now exists and normalizes requests to the new progress logic.

**Supported payloads**
```json
{ "moduleSlug": "pre-operation-inspection", "gate": "osha" }
{ "moduleSlug": "pre-operation-inspection", "complete": true }
{ "moduleId": "<uuid>", "gate": "quiz" }
```

**Recommendation:** migrate callers to `/api/training/progress` using `{ moduleSlug, stepKey }` as you touch those files.
