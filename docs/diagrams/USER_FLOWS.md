# User Flow Diagrams

## 1. User Onboarding Flow

### Internal User (Employee) Onboarding

```mermaid
graph TD
    A["User Visits Platform"] --> B["Click Sign Up"]
    B --> C["Enter Email & Details"]
    C --> D["Email Verification"]
    D --> E["Verification Link Sent"]
    E --> F["User Verifies Email"]
    F --> G["Create Password & Setup MFA"]
    G --> H["TOTP Secret Generated"]
    H --> I["Backup Codes Provided"]
    I --> J["Approval Request Submitted"]
    J --> K["Admin Approval Queue"]
    L["Admin Reviews Request"]
    K --> L
    M{"Admin Decision"}
    L --> M
    M -->|Approved| N["Email: Access Granted"]
    M -->|Rejected| O["Email: Access Denied"]
    N --> P["Assign Role & Workspace"]
    P --> Q["First Login"]
    Q --> R["Verify MFA"]
    R --> S["Access Granted to Dashboard"]
    S --> T["Redirect to Workspace"]
    O --> U["End"]
    T --> V["Onboarding Complete"]
```

### External Client Onboarding

```mermaid
graph TD
    A["Client Requests Access"] --> B["Email Submission or Form"]
    B --> C["Organization Match Check"]
    C --> D{Organization Found?}
    D -->|No| E["Notification: Org not found"]
    D -->|Yes| F["Create Pending Account"]
    F --> G["Admin Approval Queue"]
    H["Organization Admin Reviews"]
    G --> H
    I{"Decision"}
    H --> I
    I -->|Approved| J["Email: Portal Access Granted"]
    I -->|Rejected| K["Email: Request Denied"]
    J --> L["Client Sets Password"]
    L --> M["MFA Setup Optional"]
    M --> N["First Login"]
    N --> O["View Dashboard & Previews"]
    O --> P["Can Submit Feedback"]
    K --> Q["End"]
```

---

## 2. Workspace Access & Interaction Flow

### Designer Workspace Flow

```mermaid
graph TD
    A["Login to Designer Workspace"] --> B["View Design Projects"]
    B --> C{Action?}
    C -->|Create Project| D["Create New Project"]
    C -->|Open Existing| E["Open Project"]
    D --> F["Initialize Artboard"]
    E --> F
    F --> G["Enter Design Canvas"]
    G --> H["Real-time Editing Mode"]
    H --> I{Collaboration?}
    I -->|Solo| J["Work on Design"]
    I -->|Collaborative| K["Invite Collaborators"]
    K --> L["Collaborators Connected"]
    L --> J
    J --> M{"Asset Management?"}
    M -->|Create Asset| N["Upload/Create Asset"]
    M -->|Use Asset| O["Insert from Library"]
    N --> P["Asset Versioning"]
    O --> P
    P --> Q["Export Asset"]
    Q --> R["Multiple Formats"]
    R --> S["Send to Integration Workspace"]
    S --> T["Continue Working"]
```

### System Analyst Workspace Flow

```mermaid
graph TD
    A["Login to Analyst Workspace"] --> B["View Architecture Projects"]
    B --> C{Task Type?}
    C -->|Architecture Doc| D["Create/Edit Architecture"]
    C -->|Data Model| E["Design Data Schema"]
    C -->|API Spec| F["Create API Specification"]
    D --> G["Edit Rich Document"]
    E --> H["Visual Schema Designer"]
    F --> I["OpenAPI/GraphQL Editor"]
    G --> J["Add Diagrams & Text"]
    H --> K["Define Entities & Relations"]
    I --> L["Define Endpoints"]
    J --> M["Version & Review"]
    K --> M
    L --> M
    M --> N["Peer Review Process"]
    N --> O["Review Comments"]
    O --> P{Approved?}
    P -->|No| Q["Request Changes"]
    Q --> G
    P -->|Yes| R["Publish Document"]
    R --> S["Send to Integration Workspace"]
    S --> T["Available for Other Teams"]
```

### QA Testing Workspace Flow

```mermaid
graph TD
    A["Login to QA Workspace"] --> B["View Test Management"]
    B --> C{Activity?}
    C -->|Create Test| D["Create Test Case"]
    C -->|Execute Build| E["Trigger Build"]
    C -->|Track Defects| F["Manage Defects"]
    D --> G["Define Test Type"]
    G --> H["Add Test Steps"]
    H --> I["Set Expected Results"]
    I --> J["Assign Priority"]
    J --> K["Test Ready"]
    E --> L["Select Build Version"]
    L --> M["Test Execution Queue"]
    M --> N["Tests Running"]
    N --> O["Generate Results"]
    O --> P{All Passed?}
    P -->|Yes| Q["Build Passes"]
    P -->|No| R["Failed Test Report"]
    Q --> S["Promote to Staging"]
    R --> F
    F --> T["Add Defect Details"]
    T --> U["Severity Rating"]
    U --> V["Assignment"]
    V --> W["Track Resolution"]
    S --> X["Send to Integration Workspace"]
    W --> Y["Retest & Close"]
```

### AI Builder Workspace Flow

```mermaid
graph TD
    A["Login to AI Workspace"] --> B["View Models & Pipelines"]
    B --> C{Task Type?}
    C -->|Create Model| D["New Model"]
    C -->|Setup Pipeline| E["New Training Pipeline"]
    C -->|Deploy Model| F["Model Deployment"]
    D --> G["Define Model Type"]
    G --> H["Configure Parameters"]
    H --> I["Set Hyperparameters"]
    I --> J["Model Ready"]
    E --> K["Select Model"]
    K --> L["Configure Data Pipeline"]
    L --> M["Set Training Parameters"]
    M --> N["Create Training Job"]
    J --> O[Could connect to]: N
    N --> P["Job Queued"]
    P --> Q["Job Executing"]
    Q --> R["Monitor Metrics"]
    R --> S["Training Complete"]
    F --> T["Select Model Version"]
    T --> U["Choose Environment"]
    U --> V["Deploy to Staging"]
    V --> W["Verify Deployment"]
    W --> X{Production Ready?}
    X -->|No| Y["Back to Training"]
    X -->|Yes| Z["Deploy to Production"]
    S --> AA["Send to Integration"]
    Z --> AB["Model Live"]
```

---

## 3. Admin Approval workflow

```mermaid
graph TD
    A["Approval Request Received"] --> B["Admin Notification"]
    B --> C["Admin Opens Dashboard"]
    C --> D["View Pending Requests"]
    D --> E["Select Request"]
    E --> F["Review Request Details"]
    F --> G["View User Information"]
    G --> H["Check Organization"]
    H --> I{"Approve or Reject?"}
    I -->|Approve| J["Add Role"]
    I -->|Reject| K["Rejection Reason"]
    I -->|Request More Info| L["Send Message to User"]
    J --> M["Configure Workspace Access"]
    M --> N["Set Access Level"]
    N --> O["Set Expiration Optional"]
    O --> P["Send Approval Email"]
    K --> Q["Send Rejection Email"]
    L --> R["Wait for Response"]
    P --> S["User Receives Access"]
    Q --> T["End"]
    R --> U["Follow Up Review"]
```

---

## 4. Client Portal Flow

```mermaid
graph TD
    A["Client Visits Portal"] --> B["Login Page"]
    B --> C["Email & Password"]
    C --> D["Verify MFA Optional"]
    D --> E["Dashboard"]
    E --> F{View?}
    F -->|Project Progress| G["Progress Dashboard"]
    F -->|Milestones| H["Milestone Timeline"]
    F -->|Team Activity| I["Team Activity Feed"]
    E --> J{Action?}
    J -->|Preview App| K["Launch Demo Environment"]
    J -->|Submit Feedback| L["Open Feedback Form"]
    G --> M["Filter by Workspace"]
    M --> N["View KPIs"]
    H --> O["View Phases & Milestones"]
    O --> P["Track Timeline"]
    I --> Q["Recent Activities"]
    K --> R["Preview Build"]
    L --> S["Select Feedback Type"]
    S --> T["Add Comment/Attachment"]
    T --> U["Submit"]
    U --> V["Notification to Team"]
    V --> W["Feedback Tracked"]
```

---

## 5. Integration Workspace (Central Assembly) Flow

```mermaid
graph TD
    A["Integration Workspace"] --> B["Monitor Incoming Assets"]
    C["Designer Output"] --> D["Upload Assets"]
    E["Analyst Output"] --> F["Upload Documentation"]
    G["QA Output"] --> H["Build & Test Results"]
    I["AI Output"] --> J["Trained Models"]
    D --> K["Asset Aggregation Pipeline"]
    F --> K
    H --> K
    J --> K
    K --> L["Conflict Detection"]
    L --> M{Conflicts Found?}
    M -->|Yes| N["Manual Resolution"]
    M -->|No| O["Auto-merge"]
    N --> P["Review & Approve"]
    O --> P
    P --> Q["Validation Stage"]
    Q --> R["Format Validation"]
    Q --> S["Compatibility Check"]
    R --> T["Validation Passed?"]
    S --> T
    T -->|No| U["Request Fixes"]
    U --> V["Notify Original Team"]
    T -->|Yes| W["Build Assembly"]
    W --> X["Package Release"]
    X --> Y["Generate Release Candidate"]
    Y --> Z["Staging Deployment"]
    Z --> AA["Smoke Tests"]
    AA --> AB{Ready for Release?}
    AB -->|No| AC["Back to Teams"]
    AB -->|Yes| AD["Deploy to Client Preview"]
    AD --> AE["Client Notified"]
```

---

## 6. Real-time Collaboration Flow

```mermaid
graph TD
    A["User A Opens Asset"] --> B["WebSocket Connected"]
    C["User B Opens Same Asset"] --> D["WebSocket Connected"]
    B --> E["Fetch Asset State"]
    D --> E
    E --> F["Initial State Synced"]
    F --> G["Cursor Position Tracked"]
    H["User A Makes Edit"] --> I["Local Optimistic Update"]
    I --> J["Send Edit Event"]
    J --> K["Server Receives Edit"]
    K --> L["Validate Edit"]
    L --> M["Apply Operational Transform"]
    M --> N["Persist to Database"]
    N --> O["Broadcast to Other Users"]
    O --> P["User B Receives Update"]
    P --> Q["Apply to Canvas"]
    Q --> R["Cursor Position Updated"]
    R --> S![User B Sees Change]
    S --> T["Continue Editing"]
    H --> U["Timer: Save Checkpoint"]
    U --> V["Every 30 Seconds"]
```

---

## 7. Build & Release Pipeline Flow

```mermaid
graph TD
    A["Commit to Main Branch"] --> B["CI/CD Triggered"]
    B --> C["Code Compilation"]
    C --> D["Unit Tests"]
    D --> E["Integration Tests"]
    E --> F{All Pass?}
    F -->|No| G["Build Failed"]
    F -->|Yes| H["Build Artifact Created"]
    G --> I["Notification to Dev"]
    H --> J["Push to QA Workspace"]
    J --> K["QA Review & Testing"]
    K --> L["Automated Test Suite"]
    L --> M{Tests Pass?}
    M -->|No| N["Defect Report"]
    M -->|Yes| O["Build Approved"]
    N --> P["Send to Dev"]
    O --> Q["Promote to Integration Workspace"]
    Q --> R["Asset & Build Aggregation"]
    R --> S["Compatibility Checks"]
    S --> T{Compatible?}
    T -->|No| U["Request Fixes"]
    T -->|Yes| V["Release Candidate Generated"]
    U --> W["Back to Dev"]
    V --> X["Deploy to Staging"]
    X --> Y["Smoke Tests & Manual QA"]
    Y --> Z{Approved?}
    Z -->|No| AA["Back to Dev"]
    Z -->|Yes| AB["Deploy to Production"]
    AB --> AC["Monitor Health"]
    AC --> AD["Release Complete"]
```

---

## 8. Data Access & Security Flow

```mermaid
graph TD
    A["API Request"] --> B["API Gateway"]
    B --> C["Extract Token"]
    C --> D["Verify JWT Signature"]
    D --> E{Valid Token?}
    E -->|No| F["401 Unauthorized"]
    E -->|Yes| G["Extract User Context"]
    G --> H["Load User Roles & Permissions"]
    H --> I["Cache Hit?"]
    I -->|Yes| J["Use Cached Permissions"]
    I -->|No| K["Query Database"]
    J --> L["Evaluate RBAC Policy"]
    K --> L
    L --> M{Authorized?}
    M -->|No| N["403 Forbidden"]
    M -->|Yes| O["Route to Service"]
    O --> P["Service Query with Workspace Filter"]
    P --> Q["Database RLS Enforced"]
    Q --> R["Data Retrieved"]
    R --> S["Audit Log Entry"]
    S --> T["Response to Client"]
```

---

**Version**: 1.0  
**Last Updated**: February 25, 2026  
**Diagram Type**: User Flow & Process Flows
