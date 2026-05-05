# Nidaan — How it works (plain English)

## What happens when a patient submits

```
Patient on phone
    │
    │  "I'm tired all the time, my belly feels swollen,
    │   I get bruises for no reason..."
    ▼
Hits "Submit to my doctor"
    │
    ▼
Saved in the system. Doctor gets a red notification.
```

## What the doctor does

```
Doctor opens app
    │
    │  Sees: "1 new patient submission · needs review"
    ▼
Opens the case
    │
    │  Reads what the patient wrote
    │  Adds their own findings:
    │    "Spleen enlarged, platelets 54k, bone pain..."
    ▼
Clicks "Send for AI analysis"
    │
    ▼
The AI starts working. Doctor can close the laptop.
```

## What the AI is actually doing (the 6-7 minute wait)

Think of it as **six different specialists in a room, all reading the same case at the same time**:

```
       ┌──────────────────────────────┐
       │ 1. The Skeptic (Haiku)       │
       │    "Wait — is this just      │
       │    malaria? TB? Let me check │
       │    common stuff first."      │
       └──────────────┬───────────────┘
                      │ "Nope, not common."
                      ▼
       ┌──────────────────────────────┐
       │ 2. The Translator (Haiku)    │
       │    "Patient said 'big belly  │
       │    on the left.' That's      │
       │    medically: splenomegaly." │
       └──────────────┬───────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │ The     │  │ The     │  │ The     │
   │ Enzyme  │  │ Brain   │  │ Immune  │
   │ Doctor  │  │ Doctor  │  │ Doctor  │
   │(Sonnet) │  │(Sonnet) │  │(Sonnet) │
   │         │  │         │  │         │
   │ Looks   │  │ Looks   │  │ Looks   │
   │ at      │  │ at      │  │ at      │
   │ 200+    │  │ 200+    │  │ 200+    │
   │ enzyme  │  │ nerve & │  │ immune  │
   │ diseases│  │ muscle  │  │ system  │
   │         │  │ diseases│  │ diseases│
   └────┬────┘  └────┬────┘  └────┬────┘
        │            │            │
        │  Each checks medical    │
        │  databases, scientific  │
        │  papers, gene info      │
        │                         │
        └────────────┼────────────┘
                     ▼
       ┌──────────────────────────────┐
       │ 6. The Boss (Opus)           │
       │    Reads all 3 reports.      │
       │    "Two of you said Gaucher  │
       │    disease. One said maybe   │
       │    Niemann-Pick. Let's       │
       │    suggest the test that     │
       │    settles it."              │
       └──────────────┬───────────────┘
                      │
                      ▼
              Final report ready
```

## What the doctor sees when it's done

```
A neat report:
  ✓ Most likely diagnosis: Gaucher disease (98% sure)
  ✓ Second possibility: Niemann-Pick (8% sure)
  ✓ Tests to order: blood enzyme test (₹2,500)
  ✓ Specialist to refer to: Metabolic Geneticist
  ✓ Where the experts disagreed and why
```

Doctor reviews → clicks "Confirm Diagnosis" → clicks "Invite Patient"

## What the patient sees throughout

```
Day 1, 10:00 AM  →  "Doctor is reviewing your submission"
Day 1, 11:00 AM  →  "Six specialists are looking at your case
                     (this takes about 5 minutes)"
Day 1, 11:07 AM  →  "AI finished. Doctor reviewing results."
Day 1, 11:15 AM  →  "✓ Confirmed: Gaucher disease type 1
                     Nearest treatment center: FRIGE Ahmedabad,
                     8 km from you · [Get directions]
                     Government will pay ₹50 lakh for treatment.
                     Apply here: [link]"
```

The page **refreshes itself** every few seconds, so the patient doesn't have to keep checking.

## Who else uses the system

**The specialist** (e.g., the metabolic doctor at AIIMS Delhi):
> Gets a message: "Dr. Priya in Ahmedabad wants your opinion on this case." Reads it, types back: "Yes, this is classic Gaucher. Start ERT immediately." Sends it.

**The researcher** (CSIR scientist studying Gaucher in Indians):
> Logs in, asks: "How many confirmed Gaucher patients are in the system in Maharashtra?"
> System answers: "8 patients."  *(Never names. Just a count.)*
> Researcher fills a form: "I want to study GBA gene variants. Here's my ethics approval."
> Admin reviews and approves.

**The government** (Ministry of Health):
> Opens dashboard. Sees: "47 confirmed rare disease cases this year. Average 187 days from first symptom to diagnosis. Bihar has 4 patients with no treatment center in their state."
> Uses this to decide where to fund new centers.

## The whole point

```
Patient writes  →  Doctor adds expertise  →  AI does heavy lifting
       ↓                    ↓                          ↓
 Plain language    Clinical observations      6 specialist agents
                                              + medical databases
                                                       ↓
                                              Diagnosis with proof
                                                       ↓
              Patient gets clear next steps + funding info
            Government sees real data to plan policy
            Researchers can run studies (with consent)
```

That's the whole thing. A patient with mystery symptoms in a small town, a tired GP who's never seen this disease, six AI specialists and three medical databases working in the background, and at the end — an answer, a treatment center on the map, and government funding info. All in one afternoon instead of the usual 5–7 years it takes to diagnose a rare disease in India.
