# Active Listening & Phonetic Decoding

## 1. Connected Speech Mechanics

### Catenation (Consonant-to-Vowel Linking) (`catenation`)
- **Description**: When a word ends in a consonant and the next begins with a vowel sound, the consonant moves across the boundary.
- **Example**: Hold on an hour -> [həʊl.dɒ.nə.naʊ.ər]

### Elision (Sound Deletion) (`elision`)
- **Description**: In fast speech, weak vowels and alveolar stops (/t/ and /d/) disappear between consonants.
- **Example**: Next door -> [neks dɔːr], Diamond ring -> [ˈdaɪ.mən rɪŋ]

### Assimilation (Sound Transformation) (`assimilation`)
- **Description**: Alveolar consonants (/t/, /d/, /n/) adopt the place of articulation of the following consonant.
- **Example**: white paper -> whipe paper, don't you -> [dəʊntʃuː]

### Weak Forms & The Schwa (/ə/) (`schwa`)
- **Description**: Stress-timed rhythm collapses grammatical function words to weak unstressed schwa syllables.
- **Example**: for -> /fər/, was -> /wəz/, at -> /ət/

## 2. Accent Comprehension Matrix

### General American (GA)
- **Phonetic Markers**: Rhotic /r/, flap [ɾ] for t/d, broad æ in bath.

### Received Pronunciation (RP)
- **Phonetic Markers**: Non-rhotic, long open ɑː, glottal stop [ʔ].

### Australian & Commonwealth
- **Phonetic Markers**: High-rising terminal, /eɪ/ -> /aɪ/, vocalic l.

### Global & Non-Native
- **Phonetic Markers**: Syllable-timed cadence, dental fricative variations.

## 3. Active Transcription Protocol (3-Pass)

### Pass 1: undefined
- **Focus**: Macro meaning, 1.0x playback, no pauses. Write 3 bullet summary.
- **Action**: undefined

### Pass 2: undefined
- **Focus**: Loop 5-8 second chunks, 0.8x-1.0x. Type verbatim text.
- **Action**: undefined

### Pass 3: undefined
- **Focus**: Compare against transcript, mark red highlights for elision/linking.
- **Action**: undefined

## 4. Structured Dataset

```json
{
  "title": "Active Listening & Phonetic Decoding",
  "rules": [
    {
      "id": "catenation",
      "title": "Catenation (Consonant-to-Vowel Linking)",
      "example": "Hold on an hour -> [həʊl.dɒ.nə.naʊ.ər]",
      "description": "When a word ends in a consonant and the next begins with a vowel sound, the consonant moves across the boundary."
    },
    {
      "id": "elision",
      "title": "Elision (Sound Deletion)",
      "example": "Next door -> [neks dɔːr], Diamond ring -> [ˈdaɪ.mən rɪŋ]",
      "description": "In fast speech, weak vowels and alveolar stops (/t/ and /d/) disappear between consonants."
    },
    {
      "id": "assimilation",
      "title": "Assimilation (Sound Transformation)",
      "example": "white paper -> whipe paper, don't you -> [dəʊntʃuː]",
      "description": "Alveolar consonants (/t/, /d/, /n/) adopt the place of articulation of the following consonant."
    },
    {
      "id": "schwa",
      "title": "Weak Forms & The Schwa (/ə/)",
      "example": "for -> /fər/, was -> /wəz/, at -> /ət/",
      "description": "Stress-timed rhythm collapses grammatical function words to weak unstressed schwa syllables."
    }
  ],
  "accents": [
    {
      "name": "General American (GA)",
      "markers": "Rhotic /r/, flap [ɾ] for t/d, broad æ in bath."
    },
    {
      "name": "Received Pronunciation (RP)",
      "markers": "Non-rhotic, long open ɑː, glottal stop [ʔ]."
    },
    {
      "name": "Australian & Commonwealth",
      "markers": "High-rising terminal, /eɪ/ -> /aɪ/, vocalic l."
    },
    {
      "name": "Global & Non-Native",
      "markers": "Syllable-timed cadence, dental fricative variations."
    }
  ],
  "protocol": [
    {
      "pass": 1,
      "name": "Gist Capture",
      "focus": "Macro meaning, 1.0x playback, no pauses. Write 3 bullet summary."
    },
    {
      "pass": 2,
      "name": "Micro-Verbatim Transcription",
      "focus": "Loop 5-8 second chunks, 0.8x-1.0x. Type verbatim text."
    },
    {
      "pass": 3,
      "name": "Phonetic Gap Analysis",
      "focus": "Compare against transcript, mark red highlights for elision/linking."
    }
  ],
  "samplePassages": [
    {
      "id": "listen-1",
      "title": "Algorithmic Optimization & Cognitive Load",
      "audioText": "In an era dominated by algorithmic feed optimization, the human cognitive bandwidth has become the ultimate scarce commodity.",
      "ipa": "/ɪn ən ˈɪərə ˈdɒmɪneɪtɪd baɪ ˌælɡəˈrɪðmɪk fiːd ˌɒptɪmaɪˈzeɪʃən ðə ˈhjuːmən ˈkɒɡnɪtɪv ˈbændwɪdθ hæz bɪˈkʌm ði ˈʌltɪmət skeəs kəˈmɒdəti/",
      "traps": "Note elision in \"feed optimization\" and catenation in \"In an era\" [ɪ-nə-nɪərə]."
    },
    {
      "id": "listen-2",
      "title": "Organizational Agility in Distributed Teams",
      "audioText": "Organizations that prioritize synchronous consensus often suffer from severe decision paralysis and diminished velocity.",
      "ipa": "/ˌɔːɡənaɪˈzeɪʃənz ðæt praɪˈɒrɪtaɪz ˈsɪŋkrənəs kənˈsɛnsəs ˈɒf(ə)n ˈsʌfər frəm sɪˈvɪər dɪˈsɪʒən pəˈræləsɪs ənd dɪˈmɪnɪʃt vɪˈlɒsɪti/",
      "traps": "Weak form \"frəm\" and assimilation in \"often suffer\"."
    },
    {
      "id": "listen-3",
      "title": "The Paradox of Creative Constraints",
      "audioText": "Without arbitrary limitations to direct their focus, most creators fall prey to the paralysis of infinite choice.",
      "ipa": "/wɪˈðaʊt ˈɑːbɪtrəri ˌlɪmɪˈteɪʃənz tuː daɪˈrɛkt ðeə ˈfəʊkəs məʊst kriˈeɪtəz fɔːl preɪ tuː ðə pəˈræləsɪs ɒv ˈɪnfɪnɪt tʃɔɪs/",
      "traps": "Elision of final /t/ in \"most creators\" -> [məʊs kriˈeɪtəz]."
    }
  ]
}
```
