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

### Pass 1: Gist Capture
- **Focus**: Macro meaning, 1.0x playback, no pauses. Write 3 bullet summary.

### Pass 2: Micro-Verbatim Transcription
- **Focus**: Loop 5-8 second chunks, 0.8x-1.0x. Type verbatim text.

### Pass 3: Phonetic Gap Analysis
- **Focus**: Compare against transcript, mark red highlights for elision/linking.

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
    },
    {"id":"listen-4","title":"Compound Interest as Behavior","audioText":"What looks like patience is usually just a system that keeps working while you are not looking at it.","ipa":"/wɒt lʊks laɪk ˈpeɪʃəns ɪz ˈjuːʒuəli dʒʌst ə ˈsɪstəm ðət kiːps ˈwɜːkɪŋ waɪl juː ɑː nɒt ˈlʊkɪŋ æt ɪt/","traps":"Weak /ðət/ for \"that\"; linking in \"looking at it\" [lʊkɪŋ‿æt‿ɪt]."},
    {"id":"listen-5","title":"Why Meetings Multiply","audioText":"Every unresolved question quietly schedules another meeting, and nobody notices until the calendar is full.","ipa":"/ˈɛvri ˌʌnrɪˈzɒlvd ˈkwɛstʃən ˈkwaɪətli ˈʃɛdjuːlz əˈnʌðə ˈmiːtɪŋ ənd ˈnəʊbədi ˈnəʊtɪsɪz ʌnˈtɪl ðə ˈkælɪndə ɪz fʊl/","traps":"Elision of /d/ in \"unresolved question\"; weak form /ənd/ in \"meeting and nobody\"."},
    {"id":"listen-6","title":"The Cost of Context Switching","audioText":"Each interruption costs far more than the seconds it takes, because the mind has to rebuild the whole picture.","ipa":"/iːtʃ ˌɪntəˈrʌpʃən kɒsts fɑː mɔː ðən ðə ˈsɛkəndz ɪt teɪks bɪˈkɒz ðə maɪnd ˈhæs tə riːˈbɪld ðə həʊl ˈpɪktʃə/","traps":"Weak \"to\" /tə/ and devoiced \"has to\" /ˈhæs tə/; elision of /t/ in \"costs far\" [kɒs fɑː]."},
    {"id":"listen-7","title":"Trust and Transparency","audioText":"People forgive a mistake they can see, but they rarely forgive one that was hidden from them.","ipa":"/ˈpiːpl fəˈɡɪv ə mɪˈsteɪk ðeɪ kæn siː bʌt ðeɪ ˈreəli fəˈɡɪv wʌn ðət wəz ˈhɪdn̩ frəm ðəm/","traps":"Unreleased /k/ in \"mistake they\" [mɪˈsteɪk̚ ðeɪ]: the /k/ is held, not dropped; weak forms /ðət/, /wəz/, /frəm/, /ðəm/."},
    {"id":"listen-8","title":"Learning by Teaching","audioText":"If you cannot explain an idea in plain words, you probably do not understand it as well as you think.","ipa":"/ɪf juː ˈkænɒt ɪkˈspleɪn ən aɪˈdɪə ɪn pleɪn wɜːdz juː ˈprɒbəbli duː nɒt ˌʌndəˈstænd ɪt əz wɛl əz juː θɪŋk/","traps":"Catenation in \"explain an idea\" [ɪk-spleɪ-nə-naɪ-dɪə]; intrusive /r/ in \"idea in\" [aɪˈdɪər‿ɪn]; assimilation /n/→[m] in \"in plain\" [ɪm pleɪn]."},
    {"id":"listen-9","title":"The Slow Skill of Listening","audioText":"Good listeners wait for the speaker to finish before they decide what they think about what was said.","ipa":"/ɡʊd ˈlɪsnəz weɪt fə ðə ˈspiːkə tə ˈfɪnɪʃ bɪˈfɔː ðeɪ dɪˈsaɪd wɒt ðeɪ θɪŋk əˈbaʊt wɒt wəz sɛd/","traps":"Weak /fə/ and /tə/; glottal /t/ in \"wait for\" and \"what they\" [weɪʔ fə], [wɒʔ ðeɪ]: the /t/ becomes a glottal stop rather than disappearing."}
  ]
}
```
