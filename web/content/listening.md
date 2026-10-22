# Master Phonetics & Listening Passages

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
      "example": "white paper -> whipe paper, ten pounds -> [tɛm paʊndz]",
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
      "markers": "Rhotic /r/, flap [ɾ] for t/d, flat /æ/ in bath (not RP /ɑː/)."
    },
    {
      "name": "Received Pronunciation (RP)",
      "markers": "Non-rhotic, long open ɑː, glottal stop [ʔ]."
    },
    {
      "name": "Australian & Commonwealth",
      "markers": "High-rising terminal, /eɪ/ is lowered ([æɪ]) and /aɪ/ is backed ([ɒɪ]), vocalic l."
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
      "cefrLevel": "C1",
      "title": "Algorithmic Optimization & Cognitive Load",
      "audioText": "In an era dominated by algorithmic feed optimization, the human cognitive bandwidth has become the ultimate scarce commodity.",
      "ipa": "/ɪn ən ˈɪərə ˈdɒmɪneɪtɪd baɪ ˌælɡəˈrɪðmɪk fiːd ˌɒptɪmaɪˈzeɪʃən ðə ˈhjuːmən ˈkɒɡnɪtɪv ˈbændwɪdθ hæz bɪˈkʌm ði ˈʌltɪmət skeəs kəˈmɒdəti/",
      "traps": "Note linking in \"feed optimization\" [fiː-dɒp-] and catenation in \"In an era\" [ɪ-nə-nɪərə]."
    },
    {
      "id": "listen-2",
      "cefrLevel": "C1",
      "title": "Organizational Agility in Distributed Teams",
      "audioText": "Organizations that prioritize synchronous consensus often suffer from severe decision paralysis and diminished velocity.",
      "ipa": "/ˌɔːɡənaɪˈzeɪʃənz ðæt praɪˈɒrɪtaɪz ˈsɪŋkrənəs kənˈsɛnsəs ˈɒf(ə)n ˈsʌfər frəm sɪˈvɪər dɪˈsɪʒən pəˈræləsɪs ənd dɪˈmɪnɪʃt vɪˈlɒsɪti/",
      "traps": "Weak form \"frəm\"; the /t/ in \"often\" is usually silent [ˈɒfn̩ ˈsʌfə]."
    },
    {
      "id": "listen-3",
      "cefrLevel": "B2",
      "title": "The Paradox of Creative Constraints",
      "audioText": "Without arbitrary limitations to direct their focus, most creators fall prey to the paralysis of infinite choice.",
      "ipa": "/wɪˈðaʊt ˈɑːbɪtrəri ˌlɪmɪˈteɪʃənz tuː daɪˈrɛkt ðeə ˈfəʊkəs məʊst kriˈeɪtəz fɔːl preɪ tuː ðə pəˈræləsɪs ɒv ˈɪnfɪnɪt tʃɔɪs/",
      "traps": "Elision of final /t/ in \"most creators\" -> [məʊs kriˈeɪtəz]."
    },
    {
      "id": "listen-4",
      "cefrLevel": "B1",
      "title": "A System That Keeps Working",
      "audioText": "What looks like patience is usually just a system that keeps working while you are not looking at it.",
      "ipa": "/wɒt lʊks laɪk ˈpeɪʃəns ɪz ˈjuːʒuəli dʒʌst ə ˈsɪstəm ðət kiːps ˈwɜːkɪŋ waɪl juː ɑː nɒt ˈlʊkɪŋ æt ɪt/",
      "traps": "Weak /ðət/ for \"that\"; linking in \"looking at it\" [lʊkɪŋ‿æt‿ɪt]."
    },
    {
      "id": "listen-5",
      "cefrLevel": "B2",
      "title": "Why Meetings Multiply",
      "audioText": "Every unresolved question quietly schedules another meeting, and nobody notices until the calendar is full.",
      "ipa": "/ˈɛvri ˌʌnrɪˈzɒlvd ˈkwɛstʃən ˈkwaɪətli ˈʃɛdjuːlz əˈnʌðə ˈmiːtɪŋ ənd ˈnəʊbədi ˈnəʊtɪsɪz ʌnˈtɪl ðə ˈkælɪndə ɪz fʊl/",
      "traps": "Elision of /d/ in \"unresolved question\"; weak form /ənd/ in \"meeting and nobody\"."
    },
    {
      "id": "listen-6",
      "cefrLevel": "B2",
      "title": "The Cost of Context Switching",
      "audioText": "Each interruption costs far more than the seconds it takes, because the mind has to rebuild the whole picture.",
      "ipa": "/iːtʃ ˌɪntəˈrʌpʃən kɒsts fɑː mɔː ðən ðə ˈsɛkəndz ɪt teɪks bɪˈkɒz ðə maɪnd ˈhæs tə riːˈbɪld ðə həʊl ˈpɪktʃə/",
      "traps": "Weak \"to\" /tə/ and devoiced \"has to\" /ˈhæs tə/; elision of /t/ in \"costs far\" [kɒs fɑː]."
    },
    {
      "id": "listen-7",
      "cefrLevel": "B1",
      "title": "Trust and Transparency",
      "audioText": "People forgive a mistake they can see, but they rarely forgive one that was hidden from them.",
      "ipa": "/ˈpiːpl fəˈɡɪv ə mɪˈsteɪk ðeɪ kæn siː bʌt ðeɪ ˈreəli fəˈɡɪv wʌn ðət wəz ˈhɪdn̩ frəm ðəm/",
      "traps": "Unreleased /k/ in \"mistake they\" [mɪˈsteɪk̚ ðeɪ]: the /k/ is held, not dropped; weak forms /ðət/, /wəz/, /frəm/, /ðəm/."
    },
    {
      "id": "listen-8",
      "cefrLevel": "B1",
      "title": "Learning by Teaching",
      "audioText": "If you cannot explain an idea in plain words, you probably do not understand it as well as you think.",
      "ipa": "/ɪf juː ˈkænɒt ɪkˈspleɪn ən aɪˈdɪə ɪn pleɪn wɜːdz juː ˈprɒbəbli duː nɒt ˌʌndəˈstænd ɪt əz wɛl əz juː θɪŋk/",
      "traps": "Catenation in \"explain an idea\" [ɪk-spleɪ-nə-naɪ-dɪə]; intrusive /r/ in \"idea in\" (non-rhotic accents) [aɪˈdɪər‿ɪn]; assimilation /n/→[m] in \"in plain\" [ɪm pleɪn]."
    },
    {
      "id": "listen-9",
      "cefrLevel": "B1",
      "title": "The Slow Skill of Listening",
      "audioText": "Good listeners wait for the speaker to finish before they decide what they think about what was said.",
      "ipa": "/ɡʊd ˈlɪsnəz weɪt fə ðə ˈspiːkə tə ˈfɪnɪʃ bɪˈfɔː ðeɪ dɪˈsaɪd wɒt ðeɪ θɪŋk əˈbaʊt wɒt wəz sɛd/",
      "traps": "Weak /fə/ and /tə/; glottal /t/ in \"wait for\" and \"what they\" [weɪʔ fə], [wɒʔ ðeɪ]: the /t/ becomes a glottal stop rather than disappearing."
    },
    {
      "id": "listen-a1-1",
      "cefrLevel": "A1",
      "title": "A Greeting",
      "audioText": "Nice to meet you. How are you?",
      "ipa": "/naɪs tə miːt juː haʊ ə juː/",
      "traps": "Weak forms: 'to' and 'are' become /tə/ and /ə/. / Từ chức năng đọc yếu, nhẹ."
    },
    {
      "id": "listen-a1-2",
      "cefrLevel": "A1",
      "title": "Going Home",
      "audioText": "I go home at six.",
      "ipa": "/aɪ ɡəʊ həʊm ət sɪks/",
      "traps": "Weak form: 'at' is /ət/, not /æt/. / 'at' đọc nhẹ, không nhấn."
    },
    {
      "id": "listen-a1-3",
      "cefrLevel": "A1",
      "title": "Her Name",
      "audioText": "Her name is Anna.",
      "ipa": "/hɜː neɪm ɪz ˈænə/",
      "traps": "Linking: 'is' joins with 'Anna' as /ɪ-zæ/ in fast speech. / Nối âm cuối /z/ với nguyên âm sau."
    },
    {
      "id": "listen-a1-4",
      "cefrLevel": "A1",
      "title": "Three Cats",
      "audioText": "I have three cats.",
      "ipa": "/aɪ hæv θriː kæts/",
      "traps": "Say /θ/ in 'three' with the tongue between the teeth, not /s/ or /t/. / Đặt lưỡi giữa răng, đừng đọc thành /s/ hay /t/."
    },
    {
      "id": "listen-a1-5",
      "cefrLevel": "A1",
      "title": "Likes and Plurals",
      "audioText": "She likes apples and eggs.",
      "ipa": "/ʃiː laɪks ˈæplz ənd eɡz/",
      "traps": "Final -s: 'likes' ends in /s/ but 'eggs' ends in /z/. / Âm -s cuối: /s/ hay /z/ tùy âm đứng trước."
    },
    {
      "id": "listen-a1-6",
      "cefrLevel": "A1",
      "title": "Can and Can't",
      "audioText": "I can swim, but I can't run.",
      "ipa": "/aɪ kən swɪm bət aɪ kɑːnt rʌn/",
      "traps": "'can' is weak /kən/; 'can't' is strong /kɑːnt/ (RP; US /kænt/), so listen for the vowel. / 'can' đọc nhẹ, 'can't' đọc dài và rõ."
    },
    {
      "id": "listen-a2-1",
      "cefrLevel": "A2",
      "title": "Platform Announcement",
      "audioText": "The train to London leaves at ten past five. Please go to platform four and wait there.",
      "ipa": "/ðə ˈtreɪn tə ˈlʌndən ˈliːvz ət ˈten ˈpɑːst ˈfaɪv pliːz ɡəʊ tə ˈplætfɔːm ˈfɔːr ən ˈweɪt ðeə/",
      "traps": "Weak forms: \"to\", \"at\" and \"and\" sound like /tə/, /ət/ and /ən/. Little words are quiet and short (từ chức năng đọc rất nhẹ)."
    },
    {
      "id": "listen-a2-2",
      "cefrLevel": "A2",
      "title": "Too Loud in Class",
      "audioText": "Could you turn it off, please? I can't hear the teacher because it is very loud in here.",
      "ipa": "/kʊd ju ˈtɜːn ɪt ˈɒf pliːz aɪ ˈkɑːnt ˈhɪə ðə ˈtiːtʃə bɪˈkɒz ɪt ɪz ˈveri ˈlaʊd ɪn ˈhɪə/",
      "traps": "Linking: \"turn it off\" sounds like \"tur-ni-toff\" because the consonant joins the next vowel (nối âm phụ âm với nguyên âm)."
    },
    {
      "id": "listen-a2-3",
      "cefrLevel": "A2",
      "title": "Fish for Dinner",
      "audioText": "Yesterday I walked to the market and looked for fresh fish. The shop closed early, so I cooked pasta.",
      "ipa": "/ˈjestədeɪ aɪ ˈwɔːkt tə ðə ˈmɑːkɪt ən ˈlʊkt fə ˈfreʃ ˈfɪʃ ðə ˈʃɒp ˈkləʊzd ˈɜːli səʊ aɪ ˈkʊkt ˈpɑːstə/",
      "traps": "Past -ed: \"walked\", \"looked\" and \"cooked\" end in a quick /t/, and \"closed\" ends in /d/. It is easy to miss (đuôi -ed rất ngắn, dễ bỏ sót)."
    },
    {
      "id": "listen-a2-4",
      "cefrLevel": "A2",
      "title": "Sorry, I Can't Come",
      "audioText": "I'm sorry, but I can't come to dinner tonight. We haven't finished work and the boss isn't happy.",
      "ipa": "/aɪm ˈsɒri bət aɪ ˈkɑːnt ˈkʌm tə ˈdɪnə təˈnaɪt wi ˈhævnt ˈfɪnɪʃt ˈwɜːk ən ðə ˈbɒs ˈɪznt ˈhæpi/",
      "traps": "Contractions: \"I'm\", \"can't\", \"haven't\" and \"isn't\" are short and the final /t/ is weak, so listen for the stress on the verb (đuôi n't rất nhẹ, dễ nhầm với câu khẳng định)."
    },
    {
      "id": "listen-a2-5",
      "cefrLevel": "A2",
      "title": "Weekend Plans",
      "audioText": "What are you going to do this weekend? I'm going to visit my sister and watch a film.",
      "ipa": "/ˈwɒt ə ju ˈɡəʊɪŋ tə ˈduː ðɪs ˌwiːkˈend aɪm ˈɡəʊɪŋ tə ˈvɪzɪt maɪ ˈsɪstə ən ˈwɒtʃ ə ˈfɪlm/",
      "traps": "\"Going to\" often sounds like \"gonna\" /ˈɡʌnə/ in fast speech (going to đọc nhanh thành gonna)."
    },
    {
      "id": "listen-a2-6",
      "cefrLevel": "A2",
      "title": "Is This Seat Free?",
      "audioText": "Excuse me, is this seat free? Oh, yes, of course, please sit down. Would you like tea or coffee?",
      "ipa": "/ɪkˈskjuːs miː ɪz ðɪs ˈsiːt ˈfriː əʊ ˈjes əv ˈkɔːs pliːz ˈsɪt ˈdaʊn wʊd ju ˈlaɪk ˈtiː ɔː ˈkɒfi/",
      "traps": "Intonation: a yes/no question goes up at the end (free?), and a choice question goes up then down (tea or coffee). Listen to the pitch (nghe giọng lên xuống)."
    },
    {
      "id": "listen-b1-1",
      "cefrLevel": "B1",
      "title": "A Voicemail from Anna",
      "audioText": "Hi Sam, it's Anna. I'm running a bit late this morning, so please start the meeting without me. I'll call you back as soon as I get off the train.",
      "ipa": "/haɪ sæm ɪts ˈænə aɪm ˈrʌnɪŋ ə bɪt leɪt ðɪs ˈmɔːnɪŋ səʊ pliːz stɑːt ðə ˈmiːtɪŋ wɪˈðaʊt miː aɪl kɔːl juː bæk əz suːn əz aɪ ɡet ɒf ðə treɪn/",
      "traps": "Linking: the final consonant joins the next vowel, as in \"get off\" [ɡe-tɒf] and \"as soon as\" [ə-zsuː-nəz]. (Nối âm: phụ âm cuối nối với nguyên âm sau.)"
    },
    {
      "id": "listen-b1-2",
      "cefrLevel": "B1",
      "title": "Bridge Closed for Repairs",
      "audioText": "The city council has decided to close the old bridge for two months. Workers will repair the bridge next week, and drivers should expect long delays near the town centre.",
      "ipa": "/ðə ˈsɪti ˈkaʊnsl̩ həz dɪˈsaɪdɪd tə kləʊs ði əʊld brɪdʒ fə tuː mʌnθs ˈwɜːkəz wɪl rɪˈpeə ðə brɪdʒ nɛks wiːk ənd ˈdraɪvəz ʃəd ɪkˈspɛkt lɒŋ dɪˈleɪz nɪə ðə taʊn ˈsɛntə/",
      "traps": "Elision: the /t/ often disappears between consonants, so \"next week\" sounds like [nɛks wiːk]. (Nuốt âm: /t/ bị lược bỏ giữa hai phụ âm.)"
    },
    {
      "id": "listen-b1-3",
      "cefrLevel": "B1",
      "title": "A Lost Wallet",
      "audioText": "Last week I lost my wallet on the bus. A kind man found it and brought it to the station. There were ten pounds missing, but I was just happy to get it back.",
      "ipa": "/lɑːst wiːk aɪ lɒst maɪ ˈwɒlɪt ɒn ðə bʌs ə kaɪnd mæn faʊnd ɪt ənd brɔːt ɪt tə ðə ˈsteɪʃn̩ ðeə wə tɛn paʊndz ˈmɪsɪŋ bʌt aɪ wəz dʒʌst ˈhæpi tə ɡɛt ɪt bæk/",
      "traps": "Assimilation: a sound changes to match the next one, so \"ten pounds\" sounds like [tɛm paʊndz] and \"kind man\" like [kaɪm mæn]. (Đồng hóa âm: /n/ đổi thành /m/ trước /p/, /m/.)"
    },
    {
      "id": "listen-b1-4",
      "cefrLevel": "B1",
      "title": "Sleeping Better",
      "audioText": "If you want to sleep better, try to go to bed at the same time every night. You should also put your phone away an hour before you turn the light off.",
      "ipa": "/ɪf juː wɒnt tə sliːp ˈbɛtə traɪ tə ɡəʊ tə bɛd ət ðə seɪm taɪm ˈɛvri naɪt juː ʃəd ˈɔːlsəʊ pʊt jɔː fəʊn əˈweɪ ən ˈaʊə bɪˈfɔː juː tɜːn ðə laɪt ɒf/",
      "traps": "Weak forms: small words like \"to\", \"at\", \"the\" are said quickly as /tə/, /ət/, /ðə/. (Dạng yếu: các từ nhỏ đọc nhanh và nhẹ, thành âm /ə/.)"
    },
    {
      "id": "listen-b1-5",
      "cefrLevel": "B1",
      "title": "Two Years of English",
      "audioText": "I've been learning English for about two years now. I couldn't understand fast speakers at first, but they don't sound so quick anymore. I'm sure that daily practice has helped.",
      "ipa": "/aɪv biːn ˈlɜːnɪŋ ˈɪŋɡlɪʃ fər əˈbaʊt tuː jɪəz naʊ aɪ ˈkʊdnt ˌʌndəˈstænd fɑːst ˈspiːkəz ət fɜːst bʌt ðeɪ dəʊnt saʊnd səʊ kwɪk ˌɛniˈmɔː aɪm ʃɔː ðət ˈdeɪli ˈpræktɪs həz hɛlpt/",
      "traps": "Contractions: \"I've\", \"couldn't\", \"don't\", \"I'm\" are short and quick, so listen for the small sound. (Dạng rút gọn: nghe kỹ âm ngắn như I've, couldn't, don't.)"
    },
    {
      "id": "listen-b1-6",
      "cefrLevel": "B1",
      "title": "A Rainy Weekend",
      "audioText": "The weather forecast says it will rain all weekend. We wanted to go to the beach with our friends, but now we are planning a film night at home instead.",
      "ipa": "/ðə ˈwɛðə ˈfɔːkɑːst sɛz ɪt wɪl reɪn ɔːl ˌwiːkˈɛnd wiː ˈwɒntɪd tə ɡəʊ tə ðə biːtʃ wɪð ˈaʊə frɛndz bʌt naʊ wiː ɑː ˈplænɪŋ ə fɪlm naɪt ət həʊm ɪnˈstɛd/",
      "traps": "Sentence stress: the important words (weather, rain, beach, film) are louder and longer; the little words are weak. (Trọng âm câu: từ nội dung đọc mạnh, từ chức năng đọc nhẹ.)"
    },
    {
      "id": "listen-b2-1",
      "cefrLevel": "B2",
      "title": "Remote Team Retrospectives",
      "audioText": "Looking back at the last sprint, we definitely solved the database bottleneck, but we spent too much time in unscheduled catch-ups.",
      "ipa": "/ˈlʊkɪŋ bæk ət ðə lɑːst sprɪnt wi ˈdɛfɪnətli sɒlvd ðə ˈdeɪtəbeɪs ˈbɒtlnek bət wi spent tuː mʌtʃ taɪm ɪn ʌnˈʃɛdjuːld ˈkætʃʌps/",
      "traps": "Elision of /t/ in \"last sprint\" -> [lɑːs sprɪnt]; catenation in \"back at\" -> [bæ-kət]. (Nuốt âm /t/ và nối âm phụ âm - nguyên âm)."
    },
    {
      "id": "listen-b2-2",
      "cefrLevel": "B2",
      "title": "Customer Service De-escalation",
      "audioText": "I completely understand why that delivery delay caused frustration, and I'm going to look into tracking details right away.",
      "ipa": "/aɪ kəmˈpliːtli ˌʌndəˈstænd waɪ ðæt dɪˈlɪvəri dɪˈleɪ kɔːzd frʌsˈtreɪʃn̩ ənd aɪm ˈɡəʊɪŋ tə lʊk ˈɪntə ˈtrækɪŋ ˈdiːteɪlz raɪt əˈweɪ/",
      "traps": "Weak form of \"and\" -> /ənd/ or /ən/; linking in \"look into\" -> [lʊ-kɪn-tə]. (Dạng yếu của liên từ và nối âm trôi chảy)."
    },
    {
      "id": "listen-b2-3",
      "cefrLevel": "B2",
      "title": "Urban Commuting and Active Travel",
      "audioText": "Switching to an electric bicycle cut my commute in half, even though cycling in heavy rain takes some getting used to.",
      "ipa": "/ˈswɪtʃɪŋ tuː ən ɪˈlɛktrɪk ˈbaɪsɪkl kʌt maɪ kəˈmjuːt ɪn hɑːf ˈiːvn̩ ðəʊ ˈsaɪklɪŋ ɪn ˈhɛvi reɪn teɪks sʌm ˈɡɛtɪŋ ˈjuːst tə/",
      "traps": "Assimilation and reduction in \"used to\" -> [juːs tə]; unreleased /t/ in \"cut my\" [kʌt̚ maɪ]."
    },
    {
      "id": "listen-b2-4",
      "cefrLevel": "B2",
      "title": "Negotiating Flexible Working Hours",
      "audioText": "As long as our core project deadlines are met, allowing the team to choose their morning hours improves both morale and focus.",
      "ipa": "/əz lɒŋ əz ˈaʊə kɔː ˈprɒdʒɛkt ˈdɛdlaɪnz ɑː mɛt əˈlaʊɪŋ ðə tiːm tə tʃuːz ðeə ˈmɔːnɪŋ ˈaʊəz ɪmˈpruːvz bəʊθ məˈrɑːl ənd ˈfəʊkəs/",
      "traps": "Weak forms in \"as long as\" -> [əz lɒŋ əz]; \"as\" is unstressed /əz/ both times."
    },
    {
      "id": "listen-b2-5",
      "cefrLevel": "B2",
      "title": "Preparing for an Industry Presentation",
      "audioText": "We should keep our initial slides simple, so the audience can absorb the core findings before we open the floor to questions.",
      "ipa": "/wi ʃəd kiːp ˈaʊər ɪˈnɪʃl slaɪdz ˈsɪmpl səʊ ði ˈɔːdiəns kən əbˈzɔːb ðə kɔː ˈfaɪndɪŋz bɪˈfɔː wi ˈəʊpən ðə flɔː tə ˈkwɛstʃənz/",
      "traps": "Elision of /d/ in \"slides simple\" -> [slaɪz ˈsɪmpl] (may sound devoiced, [slaɪs]); weak \"can\" -> /kən/ before main verb."
    },
    {
      "id": "listen-b2-6",
      "cefrLevel": "B2",
      "title": "Evaluating Subscription Services",
      "audioText": "Most users rarely notice small monthly charges until they review their annual bank statement and calculate the total expense.",
      "ipa": "/məʊst ˈjuːzəz ˈreəli ˈnəʊtɪs smɔːl ˈmʌnθli ˈtʃɑːdʒɪz ənˈtɪl ðeɪ rɪˈvjuː ðeər ˈænjuəl bæŋk ˈsteɪtmənt ənd ˈkælkjʊleɪt ðə ˈtəʊtl ɪkˈspɛns/",
      "traps": "Unreleased /k/ in \"bank statement\" [bæŋk̚ ˈsteɪtmənt]; weak \"and\" -> /ənd/."
    },
    {
      "id": "listen-c1-1",
      "cefrLevel": "C1",
      "title": "Academic Peer Review Feedback",
      "audioText": "The reviewer questioned our sample selection methodology, arguing that the pilot cohort was too homogeneous to support broader generalizations.",
      "ipa": "/ðə rɪˈvjuːə ˈkwɛstʃənd ˈaʊə ˈsɑːmpl sɪˈlɛkʃn̩ ˌmɛθəˈdɒlədʒi ˈɑːɡjuːɪŋ ðət ðə ˈpaɪlət ˈkəʊhɔːt wəz tuː ˌhɒməʊˈdʒiːniəs tə səˈpɔːt ˈbrɔːdə ˌdʒɛnrəlaɪˈzeɪʃənz/",
      "traps": "Weak forms in \"that the\" -> [ðət ðə] and \"to support\" -> [tə səˈpɔːt]; unreleased /t/ in \"support broader\" [səˈpɔːt̚ ˈbrɔːdə]."
    },
    {
      "id": "listen-c1-2",
      "cefrLevel": "C1",
      "title": "Balancing Speed and Quality in Engineering",
      "audioText": "Rushing code to production without adequate automated testing saves days initially, but often costs weeks in emergency patching.",
      "ipa": "/ˈrʌʃɪŋ kəʊd tə prəˈdʌkʃn̩ wɪˈðaʊt ˈædɪkwət ˈɔːtəmeɪtɪd ˈtɛstɪŋ seɪvz deɪz ɪˈnɪʃəli bət ˈɒf(ə)n kɒsts wiːks ɪn ɪˈmɜːdʒənsi ˈpætʃɪŋ/",
      "traps": "Elision of /t/ in \"costs weeks\" -> [kɒs wiːks]; reduction of unstressed vowel in \"production\" -> /prəˈdʌkʃn̩/."
    },
    {
      "id": "listen-c1-3",
      "cefrLevel": "C1",
      "title": "Data Governance and User Trust",
      "audioText": "Transparent privacy policies and strict internal access controls are essential if organizations expect to retain user trust over time.",
      "ipa": "/trænsˈpærənt ˈprɪvəsi ˈpɒləsiz ənd strɪkt ɪnˈtɜːnl ˈæksɛs kənˈtrəʊlz ɑːr ɪˈsɛnʃl ɪf ˌɔːɡənaɪˈzeɪʃənz ɪkˈspɛkt tə rɪˈteɪn ˈjuːzə trʌst ˈəʊvə taɪm/",
      "traps": "Linking /r/ in \"are essential\" -> [ɑːr‿ɪˈsɛnʃl]; weak \"to\" -> /tə/ in \"expect to retain\"."
    },
    {
      "id": "listen-c1-4",
      "cefrLevel": "C1",
      "title": "Navigating Unclear Business Requirements",
      "audioText": "When requirements remain ambiguous, schedule a brief discovery workshop rather than spending days building on unchecked assumptions.",
      "ipa": "/wɛn rɪˈkwaɪəmənts rɪˈmeɪn æmˈbɪɡjuəs ˈʃɛdjuːl ə briːf dɪˈskʌvəri ˈwɜːkʃɒp ˈrɑːðə ðən ˈspɛndɪŋ deɪz ˈbɪldɪŋ ɒn ʌnˈtʃɛkt əˈsʌmpʃənz/",
      "traps": "Catenation in \"building on\" -> [ˈbɪl-dɪ-ŋɒn]; linking in \"unchecked assumptions\" [ʌnˈtʃɛk-təˈsʌmpʃənz]."
    },
    {
      "id": "listen-c1-5",
      "cefrLevel": "C1",
      "title": "Cross-Functional Alignment in Large Projects",
      "audioText": "Aligning design, product, and engineering teams early in development prevents conflicting expectations from derailing delivery milestones.",
      "ipa": "/əˈlaɪnɪŋ dɪˈzaɪn ˈprɒdʌkt ənd ˌɛndʒɪˈnɪərɪŋ tiːmz ˈɜːli ɪn dɪˈvɛləpmənt prɪˈvɛnts kənˈflɪktɪŋ ˌɛkspɛkˈteɪʃənz frəm dɪˈreɪlɪŋ dɪˈlɪvəri ˈmaɪlstəʊnz/",
      "traps": "Weak \"and\" -> /ənd/ or /ən/; linking in \"teams early\" [tiːmz‿ɜːli]."
    },
    {
      "id": "listen-c1-6",
      "cefrLevel": "C1",
      "title": "Managing Media Relations Under Scrutiny",
      "audioText": "When handling press inquiries about sensitive policy decisions, provide verifiable factual statements rather than speculative commentary.",
      "ipa": "/wɛn ˈhændlɪŋ prɛs ɪnˈkwaɪəriz əˈbaʊt ˈsɛnsətɪv ˈpɒləsi dɪˈsɪʒənz prəˈvaɪd ˈvɛrɪfaɪəbl ˈfæktʃuəl ˈsteɪtmənts ˈrɑːðə ðən ˈspɛkjʊlətɪv ˈkɒməntri/",
      "traps": "Weak form of \"than\" -> /ðən/ in \"rather than\"; the /t/ in \"statements\" is often unreleased [ˈsteɪt̚mənts]."
    },
    {
      "id": "listen-c2-1",
      "cefrLevel": "C2",
      "title": "Nuance and Register in Diplomatic Notes",
      "audioText": "The diplomatic communiqué relied on carefully calibrated ambiguity to sustain formal negotiations while avoiding binding commitments.",
      "ipa": "/ðə ˌdɪpləˈmætɪk kəˈmjuːnɪkeɪ rɪˈlaɪd ɒn ˈkeəfəli ˈkælɪbreɪtɪd ˌæmbɪˈɡjuːəti tə səˈsteɪn ˈfɔːml nɪˌɡəʊʃiˈeɪʃənz waɪl əˈvɔɪdɪŋ ˈbaɪndɪŋ kəˈmɪtmənts/",
      "traps": "Complex stress patterns in \"communiqué\" and \"ambiguity\"; weak form \"to\" before \"sustain\"."
    },
    {
      "id": "listen-c2-2",
      "cefrLevel": "C2",
      "title": "Independent Audit and Compliance Scrutiny",
      "audioText": "Independent auditors noted that repeated overrides of internal compliance warnings reflected an organizational vulnerability requiring immediate board review.",
      "ipa": "/ˌɪndɪˈpɛndənt ˈɔːdɪtəz ˈnəʊtɪd ðət rɪˈpiːtɪd ˌəʊvəˈraɪdz ɒv ɪnˈtɜːnl kəmˈplaɪəns ˈwɔːnɪŋz rɪˈflɛktɪd ən ˌɔːɡənaɪˈzeɪʃənl ˌvʌlnərəˈbɪləti rɪˈkwaɪərɪŋ ɪˈmiːdiət bɔːd rɪˈvjuː/",
      "traps": "Weak \"that\" -> /ðət/ in \"noted that\"; linking in \"repeated overrides\" [rɪˈpiːtɪ-dəʊvəˈraɪdz]; unstressed reduction in \"organizational vulnerability\"."
    },
    {
      "id": "listen-c2-3",
      "cefrLevel": "C2",
      "title": "Philosophical Frameworks in Algorithmic Ethics",
      "audioText": "Distinguishing between mathematical optimization and genuine ethical evaluation remains a central consideration for researchers studying automated decision systems.",
      "ipa": "/dɪˈstɪŋɡwɪʃɪŋ bɪˈtwiːn ˌmæθəˈmætɪkl ˌɒptɪmaɪˈzeɪʃən ənd ˈdʒɛnjuɪn ˈɛθɪkl ɪˌvæljuˈeɪʃən rɪˈmeɪnz ə ˈsɛntrəl kənˌsɪdəˈreɪʃən fə rɪˈsɜːtʃəz ˈstʌdiɪŋ ˈɔːtəmeɪtɪd dɪˈsɪʒən ˈsɪstəmz/",
      "traps": "Linking in \"genuine ethical evaluation\" [ˈdʒɛnjuɪ-nɛθɪ-kl̩]; weak \"for\" -> /fə/."
    },
    {
      "id": "listen-c2-4",
      "cefrLevel": "C2",
      "title": "Macroeconomic Volatility and Capital Reserves",
      "audioText": "Central banking authorities emphasized that maintaining countercyclical capital buffers ensures financial institutions can absorb sudden liquidity contractions without destabilizing credit markets.",
      "ipa": "/ˈsɛntrəl ˈbæŋkɪŋ ɔːˈθɒrətiz ˈɛmfəsaɪzd ðət meɪnˈteɪnɪŋ ˌkaʊntəˈsɪklɪkl ˈkæpɪtl ˈbʌfəz ɪnˈʃʊəz faɪˈnænʃl ˌɪnstɪˈtjuːʃənz kən əbˈzɔːb ˈsʌdn lɪˈkwɪdəti kənˈtrækʃənz wɪˈðaʊt diːˈsteɪbəlaɪzɪŋ ˈkrɛdɪt ˈmɑːkɪts/",
      "traps": "Assimilation inside \"banking\": /n/ -> [ŋ] before /k/ [ˈbæŋkɪŋ]; linking in \"can absorb\" [kən‿əbˈzɔːb]; glottal stop in \"credit markets\"."
    }
  ]
}
```
