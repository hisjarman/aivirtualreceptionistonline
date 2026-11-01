# CallPilot legal-consent implementation specification

This document defines the product behavior for consent capture. It is not legal advice and must be reconciled with counsel-reviewed Terms, Privacy Policy, AI/Call Recording Disclosure, Acceptable Use Policy, Cancellation/Refund Policy, and any Data Processing Addendum.

## Required acceptance points

- Account registration: accept the current Terms of Service and Privacy Policy before the OAuth registration action is initiated. Record the document keys and versions.
- Demo request: require a contact-consent checkbox and a notice-at-collection link. Marketing email consent is separate and optional.
- Discovery/onboarding submission: require Terms, Privacy/Data Processing, AI/Third-Party/Call Recording Disclosure, and authority-to-provide-data acknowledgements. Do not bundle optional marketing consent with required service terms.
- Checkout: show the exact plan, recurring amount, setup fee, allowances, overages, taxes where applicable, cancellation/refund terms, and third-party charge disclosure before redirecting to hosted checkout. Record acceptance before creating the Checkout Session and link it to the payment/customer metadata.
- Configuration approval: require customer approval of the proposed configuration and the approved AI disclosure/call handling boundaries before deployment.

## Evidence to store

For every acceptance, store the authenticated user or demo request, organization when known, consent type, document key, immutable version, content hash, accepted boolean, source flow, timestamp, and the request user-agent/IP according to the privacy policy and retention schedule. Never overwrite old acceptance rows. If a document changes materially, require re-acceptance and preserve the prior version.

## UX rules

Required boxes are unchecked by default. Each document name links to the complete current document. Do not use preselected marketing consent. The submit/continue action remains unavailable until required boxes are checked, and the UI must explain why. Provide a way to withdraw optional marketing consent and to request access, correction, deletion, or a copy of consent history.
