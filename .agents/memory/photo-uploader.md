---
name: PhotoUploader shared component
description: Where the reusable drag-drop photo upload component lives and how to use it.
---

**File:** `artifacts/wanis-ai/src/components/PhotoUploader.tsx`

**Exports:**
- `PhotoUploader` — React component with `value`, `onChange`, `label?` props. Handles drag-drop, file picker, upload progress, and clear button.
- `photoSrc(objectPath)` — converts stored object path (e.g. `/objects/uploads/uuid`) to a full `<img src>` URL. Falls back gracefully for legacy http URLs.

**Why:** Extracted from family.tsx where it was inline; now shared across memory.tsx, onboarding.tsx, and family.tsx.

**How to apply:** Import both from `@/components/PhotoUploader`. The `onChange` callback receives the object path string after upload. Pass that string to your form state and submit it as `photoUrl`.
