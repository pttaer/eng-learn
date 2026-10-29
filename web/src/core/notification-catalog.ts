/**
 * NOTIFICATION CATALOG & CREATIVE HOOK GENERATOR
 * Rich, high-converting notifications designed to captivate learners and bring them back into the app.
 * Full bilingual support (Vietnamese & English) strictly adapted to the user's setting prior to exiting the app.
 *
 * Categories:
 * 1. SRS Spaced Repetition Recall (Ebbinghaus memory decay urgency & neural trace revival)
 * 2. Streak Protection & Gamification (Preventing streak loss, midnight alerts, heroic momentum)
 * 3. Daily Quests & RPG Progression (XP gains, rank ups, mission briefings)
 * 4. IELTS Academic Skill Boosters (Writing Task 2 cohesion, Speaking 4-3-2 fluency, Reading T/F/NG, Listening Connected Speech)
 * 5. Mistake Vault Redemption (Turn saved mistakes into unshakeable active reflex)
 * 6. Micro-Learning & Curiosity Hooks (C2 vocabulary nuances, collocations, false friends, preposition traps)
 * 7. Circadian & Time-Contextual Hooks (Morning espresso, Midday reset, Commute audio, Bedtime retention, Weekend mock)
 * 8. Android Home Screen Widget dynamic alert & teaser ticker
 */

import { Locale } from './i18n';

export interface NotificationPayload {
  title: string;
  body: string;
  route: string;
  category: 'due_cards' | 'streak_reminder' | 'daily_reminder' | 'quests' | 'ielts' | 'curiosity' | 'time_context' | 'mistakes';
  type: string;
  tag: string;
}

export interface NotificationContext {
  dueCount?: number;
  sampleWords?: string[];
  streak?: number;
  questsLeft?: number;
  completedQuests?: number;
  xpToNext?: number;
  level?: number;
  rank?: string;
  weakSkill?: string;
  weakBand?: number;
  targetWord?: string;
  timeOfDay?: 'morning' | 'noon' | 'evening' | 'night' | 'weekend';
  mistakesCount?: number;
}

export class NotificationCatalog {
  /**
   * Spaced Repetition Due Reviews (Ebbinghaus Forgetting Curve Hooks)
   */
  public static getDueCardsNotification(
    dueCount: number,
    sampleWords: string[] = [],
    locale: Locale = 'en'
  ): NotificationPayload {
    const isVi = locale === 'vi';
    const namedEn = sampleWords.length > 0 ? sampleWords.map(w => `"${w}"`).join(', ') : '';
    const namedVi = sampleWords.length > 0 ? sampleWords.map(w => `"${w}"`).join(', ') : '';

    const templatesVi: Array<{ title: string; body: string }> = [
      {
        title: `SRS Review Due (${dueCount} từ): 🧠 90% từ vựng sẽ phai nhạt sau 48h!`,
        body: namedVi
          ? `Từ ${namedVi} và ${dueCount} thẻ đang đợi ôn. 2 phút kích hoạt lại để lưu vào trí nhớ dài hạn!`
          : `Bạn có ${dueCount} thẻ nhớ đang đợi ôn tập. 2 phút kích hoạt lại để lưu vào trí nhớ dài hạn!`
      },
      {
        title: `SRS Review Due (${dueCount} thẻ): ⚡ Thử thách phản xạ từ vựng`,
        body: namedVi
          ? `${namedVi} đã sẵn sàng cho buổi ôn tập hôm nay. Xem bạn đạt 100% chính xác không nào!`
          : `${dueCount} từ vựng đã sẵn sàng cho buổi ôn tập hôm nay. Xem bạn đạt 100% chính xác không nào!`
      },
      {
        title: `SRS Review Due: Đừng để từ vựng rơi rụng! (${dueCount} thẻ)`,
        body: namedVi
          ? `Bộ não cần 1 lần gợi nhớ để biến ${namedVi} thành phản xạ tự nhiên. Ôn ngay!`
          : `Bộ não cần 1 lần gợi nhớ để biến ${dueCount} từ vựng thành phản xạ tự nhiên. Ôn ngay!`
      },
      {
        title: `SRS Review Due (${dueCount} từ): 🎯 2 phút giữ vững phong độ`,
        body: `Bạn có ${dueCount} thẻ SRS sẵn sàng. Lướt nhanh trước khi quên để nhận XP và thăng hạng!`
      },
      {
        title: `SRS Review Due: 💎 Khóa chặt ${dueCount} từ vựng C2 hôm nay`,
        body: namedVi
          ? `Đừng để công sức học tập biến mất. 1 lượt ôn tập ngắn giúp bạn làm chủ ${namedVi} vĩnh viễn!`
          : `Đừng để công sức học tập biến mất. 1 lượt ôn tập ngắn giúp bạn làm chủ ${dueCount} từ vựng vĩnh viễn!`
      },
      {
        title: `SRS Review Due (${dueCount} từ): ⏳ Cửa sổ trí nhớ vàng đang mở!`,
        body: namedVi
          ? `2 phút ôn ${namedVi} ngay lúc này tiết kiệm cho bạn 20 phút phải học lại sau này.`
          : `2 phút ôn ${dueCount} thẻ lúc này tiết kiệm cho bạn 20 phút phải học lại sau này.`
      },
      {
        title: `SRS Review Due (${dueCount} thẻ): 🚀 Tăng tốc phản xạ Oxford`,
        body: namedVi
          ? `Kích hoạt phản xạ tự nhiên cho ${namedVi}. Trả lời đúng trong 3 giây để nhận huy hiệu!`
          : `Kích hoạt phản xạ tự nhiên cho ${dueCount} từ. Trả lời đúng trong 3 giây để nhận huy hiệu!`
      },
      {
        title: `SRS Review Due: 🧠 Kích hoạt nơ-ron trước khi từ vựng bị xóa nhòa (${dueCount} từ)`,
        body: namedVi
          ? `Đường liên kết thần kinh của ${namedVi} đang mờ dần. Ôn tập 60 giây để củng cố ngay!`
          : `Đường liên kết thần kinh của ${dueCount} từ đang mờ dần. Ôn tập 60 giây để củng cố ngay!`
      },
      {
        title: `SRS Review Due (${dueCount} thẻ): 🔥 60 giây blitz phản xạ đỉnh cao`,
        body: `Thử thách tốc độ với ${dueCount} thẻ SRS. Xem bạn có thể đạt tỷ lệ nhớ tuyệt đối 100% không!`
      },
      {
        title: `SRS Review Due (${dueCount} từ): 👑 Giữ vững kho từ vựng C2 của bạn`,
        body: namedVi
          ? `Các cụm từ ${namedVi} là vũ khí đắc lực cho bài thi. Đừng để chúng rời khỏi trí nhớ chủ động!`
          : `Kho từ vựng C2 là vũ khí đắc lực cho bài thi. Đừng để ${dueCount} từ rời khỏi trí nhớ chủ động!`
      },
      {
        title: `SRS Review Due: 🛡️ Củng cố trí nhớ dài hạn (${dueCount} thẻ)`,
        body: `Thuật toán SRS Spaced Repetition tính toán đây là thời điểm hoàn hảo nhất để bạn ôn tập.`
      },
      {
        title: `SRS Review Due (${dueCount} từ): ✨ Tích lũy phản xạ tự nhiên mỗi ngày`,
        body: `Chỉ 5 thẻ mỗi lượt ôn tập là chìa khóa nói trôi chảy không cần dịch nhẩm trong đầu.`
      },
      {
        title: `SRS Review Due (${dueCount} từ): ☕ 1 ngụm cà phê, 3 thẻ nhớ hoàn thành`,
        body: namedVi
          ? `Tranh thủ 90 giây lướt ${namedVi} để kích hoạt đường mòn trí nhớ dài hạn.`
          : `Tranh thủ 90 giây lướt qua ${dueCount} thẻ để kích hoạt đường mòn trí nhớ dài hạn.`
      },
      {
        title: `SRS Review Due: 🧩 Não bộ đang bật cơ chế 'dọn rác' bộ nhớ! (${dueCount} từ)`,
        body: namedVi
          ? `Nếu không gợi nhớ ngay, các từ ${namedVi} sẽ bị xếp vào nhóm quên lãng. Cứu từ vựng ngay!`
          : `Nếu không gợi nhớ ngay, ${dueCount} từ vựng sẽ bị xếp vào nhóm quên lãng. Cứu từ vựng ngay!`
      },
      {
        title: `SRS Review Due (${dueCount} thẻ): ⚔️ Áo giáp từ vựng: Đừng để công sức bay màu`,
        body: `Mỗi lần ôn đúng là 1 lần nhân đôi thời gian nhớ. Lướt nhanh ${dueCount} thẻ để giữ vững phong độ!`
      },
      {
        title: `SRS Review Due (${dueCount} từ): 🌙 Khóa thẻ trước khi ngủ để tăng x2 ghi nhớ`,
        body: `Nghiên cứu của Harvard chỉ ra việc ôn thẻ trước khi ngủ giúp củng cố trí nhớ sâu gấp hai lần.`
      }
    ];

    const templatesEn: Array<{ title: string; body: string }> = [
      {
        title: `SRS Review Due (${dueCount} item${dueCount > 1 ? 's' : ''}): 🧠 90% of memory fades in 48h!`,
        body: namedEn
          ? `Review now: ${namedEn}. Quick 2-min drill locks them into long-term retention!`
          : `You have ${dueCount} flashcard${dueCount > 1 ? 's' : ''} ready for spaced repetition recall. Retain your mastery!`
      },
      {
        title: `SRS Review Due (${dueCount} item${dueCount > 1 ? 's' : ''}): ⚡ Flashcard Recall Blitz`,
        body: namedEn
          ? `${namedEn} are ready for recall. Test your accuracy right now and score 100%!`
          : `${dueCount} words are ready for recall. Test your accuracy right now and score 100%!`
      },
      {
        title: `SRS Review Due: Don't let your vocabulary slip away! (${dueCount} items)`,
        body: namedEn
          ? `Review now: ${namedEn}. Retain your mastery and protect your hard-earned progress!`
          : `You have ${dueCount} flashcard${dueCount > 1 ? 's' : ''} ready for spaced repetition recall. Retain your mastery!`
      },
      {
        title: `SRS Review Due (${dueCount} item${dueCount > 1 ? 's' : ''}): 🎯 2-Minute Lexicon Tune-up`,
        body: `You have ${dueCount} flashcards ready for spaced repetition recall. Retain your mastery!`
      },
      {
        title: `SRS Review Due: 💎 Cement your C2 Mastery (${dueCount} cards)`,
        body: namedEn
          ? `Quick drill to lock ${namedEn} into permanent memory. Retain your mastery!`
          : `Quick drill to lock ${dueCount} words into permanent memory. Retain your mastery!`
      },
      {
        title: `SRS Review Due (${dueCount} item${dueCount > 1 ? 's' : ''}): ⏳ Golden Memory Window is open!`,
        body: namedEn
          ? `2 minutes on ${namedEn} right now saves 20 minutes of relearning later.`
          : `2 minutes on ${dueCount} cards right now saves 20 minutes of relearning later.`
      },
      {
        title: `SRS Review Due (${dueCount} item${dueCount > 1 ? 's' : ''}): 🚀 Oxford Speed Blitz`,
        body: namedEn
          ? `Ignite spontaneous recall for ${namedEn}. React within 3 seconds to claim full accuracy!`
          : `Ignite spontaneous recall for ${dueCount} words. React within 3 seconds to claim full accuracy!`
      },
      {
        title: `SRS Review Due: 🧠 Fire up your neurons before retention decays (${dueCount} words)`,
        body: namedEn
          ? `Synaptic traces for ${namedEn} are cooling down. Give them a 60-second recharge!`
          : `Synaptic traces for ${dueCount} terms are cooling down. Give them a 60-second recharge!`
      },
      {
        title: `SRS Review Due (${dueCount} item${dueCount > 1 ? 's' : ''}): 🔥 60-Second Flashcard Blitz`,
        body: `Challenge your reaction speed with ${dueCount} SRS cards. Can you score a clean 100%?`
      },
      {
        title: `SRS Review Due (${dueCount} item${dueCount > 1 ? 's' : ''}): 👑 Retain your elite C2 lexicon`,
        body: namedEn
          ? `${namedEn} will power your next essay. Keep them active and spontaneous!`
          : `Your C2 lexicon powers your next essay. Keep ${dueCount} terms active and spontaneous!`
      },
      {
        title: `SRS Review Due: 🛡️ Lock cards into permanent memory (${dueCount} items)`,
        body: `The Ebbinghaus spacing algorithm calculated this exact moment for optimal retention.`
      },
      {
        title: `SRS Review Due (${dueCount} item${dueCount > 1 ? 's' : ''}): ✨ Effortless daily recall workout`,
        body: `Consistency beats intensity. Review ${dueCount} cards today to sound natural without hesitation.`
      },
      {
        title: `SRS Review Due (${dueCount} item${dueCount > 1 ? 's' : ''}): ☕ 1 Espresso Sip, 3 Cards Done`,
        body: namedEn
          ? `Take 90 seconds to review ${namedEn} and cement active fluency.`
          : `Take 90 seconds to review ${dueCount} cards and cement active fluency.`
      },
      {
        title: `SRS Review Due: 🧩 Synaptic Pruning Alert (${dueCount} words)`,
        body: namedEn
          ? `Without quick recall, your brain begins discarding ${namedEn}. Rescue them now!`
          : `Without quick recall, your brain begins discarding ${dueCount} words. Rescue them now!`
      },
      {
        title: `SRS Review Due (${dueCount} cards): ⚔️ Lexical Armor: Double your retention`,
        body: `Every successful recall doubles memory duration. Run a lightning sprint through ${dueCount} cards!`
      },
      {
        title: `SRS Review Due (${dueCount} items): 🌙 Bedtime Memory Lock`,
        body: `Harvard cognitive research shows pre-sleep card recall cements synaptic retention twice as fast.`
      }
    ];

    const templates = isVi ? templatesVi : templatesEn;
    const selected = templates[Math.floor(Math.random() * templates.length)];

    return {
      title: selected.title,
      body: selected.body,
      route: '#collocations',
      category: 'due_cards',
      type: 'due_cards',
      tag: 'srs-review-due'
    };
  }

  /**
   * Streak Protection & Gamification (Heroic FOMO & Fire Defense)
   */
  public static getStreakReminderNotification(
    streak: number,
    questsLeft: number = 0,
    locale: Locale = 'en'
  ): NotificationPayload {
    const isVi = locale === 'vi';
    const questNoteVi = questsLeft > 0 ? `Còn ${questsLeft} nhiệm vụ hôm nay.` : 'Hôm nay bạn chưa hoàn thành bài tập.';
    const questNoteEn = questsLeft > 0 ? `${questsLeft} quest${questsLeft === 1 ? '' : 's'} left today.` : 'Today\'s quests need your attention.';

    const templatesVi: Array<{ title: string; body: string }> = [
      {
        title: `Streak Protection Alert (${streak} Ngày): 🔥 Báo động! Chuỗi sắp tắt`,
        body: `Đừng để chuỗi ${streak} ngày tâm huyết bị đứt đoạn! ${questNoteVi} Chỉ 1 bài tập 3 phút là cứu được ngay.`
      },
      {
        title: `Streak Protection Alert (${streak} Ngày): 👑 Kiên trì phi thường!`,
        body: `Chuỗi ${streak} ngày đang chờ bạn tiếp lửa. ${questNoteVi} Hoàn thành 1 bài tập trước nửa đêm nhé!`
      },
      {
        title: `Streak Protection Alert (${streak} Ngày): 🛡️ Kích hoạt Khiên bảo vệ chuỗi`,
        body: `Đừng đánh mất chuỗi ${streak} ngày rực rỡ! ${questNoteVi} Dành 3 phút ôn luyện để giữ vững đà tiến bộ.`
      },
      {
        title: `Streak Protection Alert: ⚡ 3 phút giữ trọn chuỗi ${streak} ngày!`,
        body: `Bản thân bạn trong tương lai sẽ cảm ơn bạn vì đã không bỏ cuộc hôm nay. ${questNoteVi} Vào app ngay!`
      },
      {
        title: `Streak Protection Alert (${streak} Ngày): ⏳ Đồng hồ đang đếm ngược!`,
        body: `Chỉ còn vài tiếng nữa là hết ngày! ${questNoteVi} Bảo vệ kỷ lục ${streak} ngày học của bạn nào!`
      },
      {
        title: `Streak Protection Alert (${streak} Ngày): 🚨 Cảnh báo nửa đêm sắp điểm!`,
        body: `Ngọn lửa ${streak} ngày không được phép lụi tàn. Dành 1 bài drill ngắn để giữ trọn thành tích!`
      },
      {
        title: `Streak Protection Alert (${streak} Ngày): 🌟 Bạn thuộc top 5% người học bền bỉ nhất!`,
        body: `Một kỷ lục đáng nể! ${questNoteVi} Mở app 2 phút để bảo vệ chuỗi ngày huyền thoại.`
      },
      {
        title: `Streak Protection Alert: 🔥 Tiếp lửa cho chuỗi ${streak} ngày trước khi hết ngày!`,
        body: `Mỗi ngày học là 1 viên gạch xây nên sự lưu loát. Đừng để gián đoạn hôm nay!`
      },
      {
        title: `Streak Protection Alert (${streak} Ngày): ⚔️ Đừng để chuỗi ngày tâm huyết về con số 0!`,
        body: `Kỷ lục ${streak} ngày đòi hỏi bao nỗ lực. ${questNoteVi} Vào app giải quyết ngay thôi!`
      },
      {
        title: `Streak Protection Alert (${streak} Ngày): 💎 Giữ trọn kỷ lục học tập đáng tự hào!`,
        body: `Thói quen tốt cần được bảo vệ. 1 lượt kiểm tra từ vựng giúp bạn duy trì phong độ xuất sắc.`
      },
      {
        title: `Streak Protection Alert (${streak} Ngày): 🏆 Chỉ 1 bài tập 3 phút để nối dài kỳ tích!`,
        body: `Chinh phục cột mốc tiếp theo. ${questNoteVi} Tiếp tục thắp sáng ngọn lửa học tập!`
      },
      {
        title: `Streak Protection Alert (${streak} Ngày): 🚀 Đỉnh cao phản xạ - Đừng bỏ lỡ hôm nay!`,
        body: `Duy trì quán tính học tập là bí quyết số 1 của người đạt IELTS 8.0+. Cứu chuỗi ngay!`
      },
      {
        title: `Streak Protection Alert (${streak} Ngày): 🚨 Báo động đỏ 23:00!`,
        body: `Chuỗi ${streak} ngày sẽ biến mất khi kim đồng hồ chỉ nửa đêm. ${questNoteVi} 2 phút cứu vãn thành quả!`
      },
      {
        title: `Streak Protection Alert (${streak} Ngày): 🤝 Giữ lời hứa với chính mình`,
        body: `Quy tắc vàng: Không bao giờ bỏ lỡ hai ngày liên tiếp. Tiếp tục chuỗi ${streak} ngày tự hào!`
      },
      {
        title: `Streak Protection Alert (${streak} Ngày): 🎯 Chỉ 1 ngày nữa để chạm mốc tiếp theo!`,
        body: `Cột mốc mới đang vẫy gọi. Đừng để đứt đoạn ngay trước vạch đích!`
      },
      {
        title: `Streak Protection Alert: 🔥 Ngọn lửa ${streak} ngày - Danh hiệu Học giả kiên định`,
        body: `Rất ít người đạt tới chuỗi ${streak} ngày như bạn. 3 phút bảo vệ huy chương vàng thành tích!`
      }
    ];

    const templatesEn: Array<{ title: string; body: string }> = [
      {
        title: `Streak Protection Alert (${streak} Days): 🔥 Danger! Streak at risk`,
        body: `Don't break your ${streak}-day streak. ${questNoteEn} 1 quick session saves it all.`
      },
      {
        title: `Streak Protection Alert (${streak} Days): 👑 Unstoppable grit!`,
        body: `Don't break your ${streak}-day streak. ${questNoteEn} Keep the legendary fire burning!`
      },
      {
        title: `Streak Protection Alert (${streak} Days): 🛡️ Streak Shield Activated`,
        body: `Don't break your ${streak}-day streak. ${questNoteEn} Spend 3 quick minutes to secure your momentum!`
      },
      {
        title: `Streak Protection Alert: ⚡ 3 minutes to defend your ${streak}-day streak!`,
        body: `Don't break your ${streak}-day streak. ${questNoteEn} Your future fluent self will thank you!`
      },
      {
        title: `Streak Protection Alert (${streak} Days): ⏳ Clock is ticking!`,
        body: `Don't break your ${streak}-day streak. ${questNoteEn} Keep the chain unbroken before midnight!`
      },
      {
        title: `Streak Protection Alert (${streak} Days): 🚨 Midnight countdown warning!`,
        body: `Your ${streak}-day fire must not burn out. 1 quick drill defends your streak before the clock strikes 12!`
      },
      {
        title: `Streak Protection Alert (${streak} Days): 🌟 You're in the top 5% of relentless learners!`,
        body: `A monumental milestone! ${questNoteEn} Defend your heroic momentum with a 2-minute review.`
      },
      {
        title: `Streak Protection Alert: 🔥 Keep the fire burning for your ${streak}-day streak!`,
        body: `Fluency is built one day at a time. Protect your consecutive record before today ends!`
      },
      {
        title: `Streak Protection Alert (${streak} Days): ⚔️ Don't let your heroic momentum reset to zero!`,
        body: `${streak} consecutive days of hard work is at stake. ${questNoteEn} Jump back in!`
      },
      {
        title: `Streak Protection Alert (${streak} Days): 💎 Protect your proud learning record!`,
        body: `Habits define mastery. Complete 1 quick drill to keep your streak intact.`
      },
      {
        title: `Streak Protection Alert (${streak} Days): 🏆 1 quick 3-minute session preserves your legacy!`,
        body: `Push toward your next milestone. ${questNoteEn} Fuel the flame now!`
      },
      {
        title: `Streak Protection Alert (${streak} Days): 🚀 Unbroken momentum - Save it right now!`,
        body: `Daily continuity is the #1 secret to IELTS 8.0+. Keep your rhythm alive!`
      },
      {
        title: `Streak Protection Alert (${streak} Days): 🚨 Red Alert: Midnight Countdown!`,
        body: `Your ${streak}-day streak expires at midnight. ${questNoteEn} 2 minutes preserves your legacy!`
      },
      {
        title: `Streak Protection Alert (${streak} Days): 🤝 Never miss twice`,
        body: `The atomic habit law: consistency compounds exponentially. Defend your ${streak}-day record!`
      },
      {
        title: `Streak Protection Alert (${streak} Days): 🎯 Just 1 day away from your next milestone!`,
        body: `You are on the cusp of an elite milestone. Don't stumble on the home stretch!`
      },
      {
        title: `Streak Protection Alert: 🔥 ${streak}-Day Fire - Relentless Scholar status`,
        body: `Very few reach a ${streak}-day streak. 3 minutes locks in your gold medal momentum!`
      }
    ];

    const templates = isVi ? templatesVi : templatesEn;
    const selected = templates[Math.floor(Math.random() * templates.length)];

    return {
      title: selected.title,
      body: selected.body,
      route: '#collocations',
      category: 'streak_reminder',
      type: 'streak_reminder',
      tag: 'srs-review-due'
    };
  }

  /**
   * Daily Personalized Reminders (IELTS Focus, Mistake Vault, Daily Quests, Micro-learning, Time of day)
   */
  public static getDailyReminderNotification(
    ctx: NotificationContext,
    locale: Locale = 'en'
  ): NotificationPayload {
    const isVi = locale === 'vi';
    const level = ctx.level || 1;
    const questsLeft = ctx.questsLeft ?? 0;
    const xpToNext = ctx.xpToNext || 50;
    const rank = ctx.rank || (isVi ? 'Học giả' : 'Scholar');
    const streak = ctx.streak || 0;
    const streakNoteVi = streak > 0 ? ` • Chuỗi ${streak}d` : '';
    const streakNoteEn = streak > 0 ? ` • ${streak}d streak` : '';
    const progressLineVi = `Cấp ${level}${streakNoteVi}, còn ${xpToNext} XP đến cấp tiếp theo, còn ${questsLeft} nhiệm vụ hôm nay.`;
    const progressLineEn = `Level ${level}${streakNoteEn}, ${xpToNext} XP to next rank, ${questsLeft} quest${questsLeft === 1 ? '' : 's'} left.`;

    // 1. Weakest IELTS Skill Focus
    if (ctx.weakSkill && typeof ctx.weakBand === 'number') {
      const skillLower = ctx.weakSkill.toLowerCase();
      const skillNameEn = ctx.weakSkill.charAt(0).toUpperCase() + ctx.weakSkill.slice(1);
      const skillMapVi: Record<string, string> = {
        listening: 'Luyện Nghe',
        reading: 'Đọc Hiểu',
        writing: 'Luyện Viết',
        speaking: 'Luyện Nói'
      };
      const skillNameVi = skillMapVi[skillLower] || ctx.weakSkill;
      const bandStr = ctx.weakBand.toFixed(1);

      if (isVi) {
        const skillHooksVi: Record<string, Array<{ title: string; body: string }>> = {
          writing: [
            {
              title: `Tiêu điểm IELTS: ${skillNameVi} (Band ${bandStr}) • Bí quyết Task 2`,
              body: `Đừng viết 'In my opinion' - hãy thử 'It is widely contended that...'. Dành 5 phút copywork Franklin để nâng band!`
            },
            {
              title: `Tiêu điểm IELTS: ${skillNameVi} (Band ${bandStr}) • Đa dạng liên từ`,
              body: `Thay vì lặp lại 'Moreover', hãy thử 'Equally compelling is...'. Vào Franklin Copywork thực hành ngay!`
            },
            {
              title: `Tiêu điểm IELTS: ${skillNameVi} (Band ${bandStr}) • Cấu trúc đảo ngữ`,
              body: `Nâng điểm Grammatical Range với cấu trúc 'Seldom have we witnessed...'. Luyện viết 1 câu Band 8.5!`
            }
          ],
          speaking: [
            {
              title: `Tiêu điểm IELTS: ${skillNameVi} (Band ${bandStr}) • Phản xạ 4-3-2`,
              body: `Giám khảo AI đang chờ bạn. Luyện nói 4-3-2 để triệt tiêu từ đệm và nâng cao độ trôi chảy!`
            },
            {
              title: `Tiêu điểm IELTS: ${skillNameVi} (Band ${bandStr}) • Nói không bí ý`,
              body: `Bí quyết kéo dài câu trả lời Part 2 bằng kỹ thuật PAST-PRESENT-FUTURE. Vào Speech Simulator thử sức!`
            },
            {
              title: `Tiêu điểm IELTS: ${skillNameVi} (Band ${bandStr}) • Nối âm tự nhiên`,
              body: `Làm chủ hiện tượng nuốt âm và nối âm Connected Speech để bài nói tự nhiên như người bản xứ.`
            }
          ],
          reading: [
            {
              title: `Tiêu điểm IELTS: ${skillNameVi} (Band ${bandStr}) • Bẫy True/False`,
              body: `Luyện kỹ thuật Skimming & Scanning 5 phút hôm nay để tránh bẫy 'Not Given' kinh điển!`
            },
            {
              title: `Tiêu điểm IELTS: ${skillNameVi} (Band ${bandStr}) • Quét từ đồng nghĩa`,
              body: `Giám khảo không hỏi từ gốc, họ dùng Paraphrasing. 5 phút luyện tìm cặp từ đồng nghĩa trong Passage!`
            },
            {
              title: `Tiêu điểm IELTS: ${skillNameVi} (Band ${bandStr}) • Tăng tốc độ đọc`,
              body: `Mục tiêu 250 từ/phút: Xử lý nhẹ nhàng các bài đọc Academic dài và khó trong 5 phút drill.`
            }
          ],
          listening: [
            {
              title: `Tiêu điểm IELTS: ${skillNameVi} (Band ${bandStr}) • Nghe giọng bản xứ`,
              body: `Bắt trọn hiện tượng nối âm connected speech trong Section 3 với 1 bài nghe ngắn hôm nay!`
            },
            {
              title: `Tiêu điểm IELTS: ${skillNameVi} (Band ${bandStr}) • Bẫy số & đánh vần`,
              body: `Tránh mất điểm oan ở Section 1: Luyện phản xạ bắt số điện thoại và tên riêng hiểm hóc!`
            },
            {
              title: `Tiêu điểm IELTS: ${skillNameVi} (Band ${bandStr}) • Luyện nghe phân tâm`,
              body: `Nhận diện bẫy 'đổi ý phút chót' của người nói trong bài thi IELTS Listening qua 1 bài test nhanh.`
            }
          ]
        };

        const list = skillHooksVi[skillLower] || [
          {
            title: `Tiêu điểm IELTS: ${skillNameVi} (Band ${bandStr})`,
            body: `Dành 10 phút cải thiện kỹ năng yếu nhất hôm nay sẽ tạo bước nhảy vọt! ${progressLineVi}`
          }
        ];
        const specific = list[Math.floor(Math.random() * list.length)];

        return {
          title: specific.title,
          body: specific.body,
          route: `ielts.html#${ctx.weakSkill}`,
          category: 'ielts',
          type: 'daily_reminder',
          tag: 'srs-review-due'
        };
      } else {
        const skillHooksEn: Record<string, Array<{ title: string; body: string }>> = {
          writing: [
            {
              title: `IELTS focus: ${skillNameEn} (band ${bandStr}) • Task 2 Secret`,
              body: `Swap 'In my opinion' for 'It is widely contended that...'. 5 minutes in Franklin Copywork Studio to elevate cohesion!`
            },
            {
              title: `IELTS focus: ${skillNameEn} (band ${bandStr}) • Cohesive Devices`,
              body: `Overusing 'Moreover'? Try 'Equally compelling is...'. Jump into Franklin Copywork right now!`
            },
            {
              title: `IELTS focus: ${skillNameEn} (band ${bandStr}) • Grammatical Inversion`,
              body: `Boost your Grammatical Range score with 'Seldom have we witnessed...'. Practice 1 model sentence!`
            }
          ],
          speaking: [
            {
              title: `IELTS focus: ${skillNameEn} (band ${bandStr}) • 4-3-2 Fluency`,
              body: `Your AI examiner is ready. Complete a 4-3-2 speech drill to eliminate filler words today!`
            },
            {
              title: `IELTS focus: ${skillNameEn} (band ${bandStr}) • Part 2 Narrative Flow`,
              body: `Never freeze in Part 2 again. Master the Past-Present-Future expansion formula in Speech Simulator!`
            },
            {
              title: `IELTS focus: ${skillNameEn} (band ${bandStr}) • Connected Speech`,
              body: `Master weak forms and consonant-vowel linking to sound effortlessly natural to examiners.`
            }
          ],
          reading: [
            {
              title: `IELTS focus: ${skillNameEn} (band ${bandStr}) • T/F/NG Traps`,
              body: `Master the subtle line between 'False' and 'Not Given'. 5-minute speed scan drill ready!`
            },
            {
              title: `IELTS focus: ${skillNameEn} (band ${bandStr}) • Paraphrase Hunt`,
              body: `Questions test paraphrases, not word-for-word copies. 5-minute drill scanning synonym pairs!`
            },
            {
              title: `IELTS focus: ${skillNameEn} (band ${bandStr}) • Reading Speed Sprint`,
              body: `Target 250+ WPM to conquer dense Academic Passage 3 text without time crunch pressure.`
            }
          ],
          listening: [
            {
              title: `IELTS focus: ${skillNameEn} (band ${bandStr}) • Connected Speech`,
              body: `Train your ear on rapid Section 3 elisions and weak forms in a quick listening chamber session!`
            },
            {
              title: `IELTS focus: ${skillNameEn} (band ${bandStr}) • Section 1 Traps`,
              body: `Never lose easy points on phone numbers, postcodes, or spelling changes in Section 1!`
            },
            {
              title: `IELTS focus: ${skillNameEn} (band ${bandStr}) • Distractor Elimination`,
              body: `Catch the speaker's sudden self-correction before it trips up your answer sheet!`
            }
          ]
        };

        const list = skillHooksEn[skillLower] || [
          {
            title: `IELTS focus: ${skillNameEn} (band ${bandStr})`,
            body: `Ten minutes on your weakest skill today. ${progressLineEn}`
          }
        ];
        const specific = list[Math.floor(Math.random() * list.length)];

        return {
          title: specific.title,
          body: specific.body,
          route: `ielts.html#${ctx.weakSkill}`,
          category: 'ielts',
          type: 'daily_reminder',
          tag: 'srs-review-due'
        };
      }
    }

    // 2. Mistake Vault Redemption (Turn errors into unshakeable strengths)
    if (ctx.mistakesCount && ctx.mistakesCount > 0) {
      if (isVi) {
        const mistakeOptionsVi = [
          {
            title: `🎯 Phục thù lỗi sai: Bạn có ${ctx.mistakesCount} lỗi trong Mistake Vault!`,
            body: `Biến điểm yếu thành vũ khí phản xạ. Dành 2 phút luyện lại để không bao giờ lặp lại lỗi này trong bài thi!`,
            route: '#mistakes'
          },
          {
            title: `⚡ Mistake Vault: ${ctx.mistakesCount} lỗi ngữ pháp đang chờ xử lý`,
            body: `Khoa học học tập: Sửa lỗi sai cá nhân giúp tăng điểm nhanh gấp 3 lần học kiến thức mới. Vào thanh toán ngay!`,
            route: '#mistakes'
          },
          {
            title: `🛡️ Xóa sạch vết hổng kiến thức: ${ctx.mistakesCount} câu chờ sửa`,
            body: `Đừng để thói quen sai cắm rễ vào tiềm thức. 90 giây kiểm tra lại các lỗi gần đây trong Mistake Vault.`,
            route: '#mistakes'
          }
        ];
        const pickedMistake = mistakeOptionsVi[Math.floor(Math.random() * mistakeOptionsVi.length)];
        return {
          title: pickedMistake.title,
          body: pickedMistake.body,
          route: pickedMistake.route,
          category: 'mistakes',
          type: 'daily_reminder',
          tag: 'srs-review-due'
        };
      } else {
        const mistakeOptionsEn = [
          {
            title: `🎯 Mistake Vault: ${ctx.mistakesCount} recorded error${ctx.mistakesCount > 1 ? 's' : ''} awaiting redemption!`,
            body: `Turn vulnerabilities into unshakeable strengths. 2 minutes in your Mistake Vault cements accurate reflex!`,
            route: '#mistakes'
          },
          {
            title: `⚡ Mistake Vault: ${ctx.mistakesCount} grammar slip-ups need rehabilitation`,
            body: `Cognitive science: Correcting your own past mistakes yields 3x faster score gains than passive reading. Clear them now!`,
            route: '#mistakes'
          },
          {
            title: `🛡️ Seal your knowledge gaps: ${ctx.mistakesCount} item${ctx.mistakesCount > 1 ? 's' : ''} to review`,
            body: `Prevent wrong patterns from fossilizing. Take a 90-second micro-drill through your Mistake Vault!`,
            route: '#mistakes'
          }
        ];
        const pickedMistake = mistakeOptionsEn[Math.floor(Math.random() * mistakeOptionsEn.length)];
        return {
          title: pickedMistake.title,
          body: pickedMistake.body,
          route: pickedMistake.route,
          category: 'mistakes',
          type: 'daily_reminder',
          tag: 'srs-review-due'
        };
      }
    }

    // 3. Unfinished Quests & Level Promotion
    if (questsLeft > 0) {
      if (isVi) {
        const questOptionsVi = [
          {
            title: `🎯 Còn ${questsLeft} nhiệm vụ hôm nay • Nhận ngay +50 XP`,
            body: `Chỉ thiếu ${xpToNext} XP nữa là thăng Cấp ${level + 1}! Hoàn thành để chạm mốc ${rank}.`
          },
          {
            title: `⚔️ Nhiệm vụ thăng hạng: Còn ${questsLeft} mục chờ bạn giải quyết`,
            body: `Đừng để lỡ phần thưởng ngày. 3 phút hoàn thành bài tập để nhận trọn +150 XP và mở rương!`
          },
          {
            title: `🌟 Đột phá cấp độ: Cấp ${level} đang chờ bạn bứt phá`,
            body: `Chỉ cần hoàn thành ${questsLeft} nhiệm vụ còn lại để duy trì chuỗi và thăng hạng hôm nay!`
          },
          {
            title: `💎 Kho báu XP ngày: Nhận thưởng trọn vẹn hôm nay`,
            body: `Còn ${questsLeft} nhiệm vụ chưa nhận thưởng. 2 phút hoàn tất để tăng hạng bảng tổng sắp!`
          }
        ];
        const pickedQuest = questOptionsVi[Math.floor(Math.random() * questOptionsVi.length)];
        return {
          title: pickedQuest.title,
          body: pickedQuest.body,
          route: '#collocations',
          category: 'quests',
          type: 'daily_reminder',
          tag: 'srs-review-due'
        };
      } else {
        const questOptionsEn = [
          {
            title: `🎯 ${questsLeft} quest${questsLeft === 1 ? '' : 's'} left today • Claim +50 XP`,
            body: `Only ${xpToNext} XP away from Level ${level + 1}! Complete today's quests and push toward ${rank}.`
          },
          {
            title: `⚔️ Daily Mission Briefing: ${questsLeft} objectives remain`,
            body: `Don't leave XP on the table. 3 minutes completes your daily checklist for full +150 XP reward!`
          },
          {
            title: `🌟 Rank Promotion: Level ${level} surge incoming`,
            body: `Finish the remaining ${questsLeft} quest${questsLeft === 1 ? '' : 's'} to secure your progression today!`
          },
          {
            title: `💎 XP Bounty: Claim your full daily completion crate`,
            body: `${questsLeft} quest${questsLeft === 1 ? '' : 's'} left. 2 quick minutes secures your place on the leaderboard!`
          }
        ];
        const pickedQuest = questOptionsEn[Math.floor(Math.random() * questOptionsEn.length)];
        return {
          title: pickedQuest.title,
          body: pickedQuest.body,
          route: '#collocations',
          category: 'quests',
          type: 'daily_reminder',
          tag: 'srs-review-due'
        };
      }
    }

    // 4. Time Context & Linguistic Curiosity Catalog (Engaging, creative, irresistible)
    const currentHour = new Date().getHours();
    const dayOfWeek = new Date().getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const generalVi: Array<{ title: string; body: string; route: string }> = [
      {
        title: 'Time to learn today: Giữ vững nhịp học',
        body: `10 phút học mỗi ngày duy trì chuỗi thành tích. ${progressLineVi}`,
        route: '#collocations'
      },
      {
        title: '☕ 3 phút cà phê cùng tiếng Anh: Nạp 1 cụm từ C2',
        body: `Không cần học nhiều, chỉ cần 1 cấu trúc C2 mỗi ngày để phản xạ như người bản xứ!`,
        route: '#collocations'
      },
      {
        title: '✍️ Phòng luyện viết Franklin: Câu văn Band 8.0',
        body: `Chép và phân tích 1 câu mẫu tu từ để nâng tầm độ mạch lạc trong bài viết!`,
        route: 'ielts.html#writing'
      },
      {
        title: '🎙️ Luyện nói 4-3-2: Phản xạ trôi chảy trong 4 phút',
        body: `Giám khảo AI đã sẵn sàng. Luyện nói 4-3-2 để xóa tan ngập ngừng hôm nay!`,
        route: 'ielts.html#speaking'
      },
      {
        title: '🌙 Ôn tập trước khi ngủ: Ghi nhớ sâu gấp đôi',
        body: `Khoa học chứng minh 5 phút lướt thẻ từ trước khi ngủ giúp củng cố trí nhớ dài hạn!`,
        route: '#collocations'
      },
      {
        title: '💡 Collocation bản xứ: Bạn có biết?',
        body: `Người bản xứ không nói 'make damage', họ nói 'cause damage' hoặc 'inflict damage'. Nạp thêm cụm chuẩn ngay!`,
        route: '#collocations'
      },
      {
        title: '🔍 Bẫy giới từ phổ biến: ' + (ctx.targetWord || 'Juxtapose'),
        body: `'Agree with' hay 'Agree to'? Tìm hiểu sự khác biệt tinh tế giúp bạn tránh mất điểm oan!`,
        route: '#collocations'
      },
      {
        title: '⚡ Từ vựng C2 đắt giá: Thay thế từ đơn giản',
        body: `Thay vì dùng 'big problem', hãy thử 'insurmountable obstacle' để gây ấn tượng mạnh với giám khảo!`,
        route: '#collocations'
      },
      {
        title: '🧩 False Friends trong tiếng Anh: Cảnh giác!',
        body: `'Actually' không có nghĩa là 'hiện tại', mà là 'thực ra là'. Đừng để dịch nhẩm tiếng Việt đánh lừa bạn!`,
        route: '#collocations'
      },
      {
        title: '💎 Cụm từ vàng cho Task 2: ' + (ctx.targetWord || 'Paradigm'),
        body: `Thay vì nói 'Nowadays many people think', hãy thử 'It is widely contended in contemporary discourse'.`,
        route: 'ielts.html#writing'
      },
      {
        title: "🎯 Bẫy 'She suggested me to go' - Bạn có sửa được?",
        body: `Đây là lỗi phổ biến nhất trong IELTS Writing! Cấu trúc chuẩn là 'She suggested that I go'. Kiểm tra thêm lỗi khác!`,
        route: 'ielts.html#writing'
      },
      {
        title: '🚀 Cải thiện phát âm: Bẫy nối âm Connected Speech',
        body: `Tại sao 'first time' nghe như 'fers-time'? Tìm hiểu hiện tượng nuốt âm để nghe giọng người bản xứ không bị ngợp.`,
        route: 'ielts.html#listening'
      },
      {
        title: '🎧 Chế độ Commute Audio: Nghe thụ động trên đường',
        body: `Bật Commute Audio 5 phút trên xe buýt hoặc khi đi bộ để tắm ngôn ngữ không tốn sức!`,
        route: '#collocations'
      },
      {
        title: '🧩 False Friends trong tiếng Anh: Cảnh giác!',
        body: `'Actually' không có nghĩa là 'hiện tại', mà là 'thực ra là'. Đừng để dịch nhẩm tiếng Việt đánh lừa bạn!`,
        route: '#collocations'
      },
      {
        title: '💎 Cụm từ vàng cho Task 2: ' + (ctx.targetWord || 'Paradigm'),
        body: `Thay vì nói 'Nowadays many people think', hãy thử 'It is widely contended in contemporary discourse'.`,
        route: 'ielts.html#writing'
      },
      {
        title: "🎯 Bẫy 'She suggested me to go' - Bạn có sửa được?",
        body: `Đây là lỗi phổ biến nhất trong IELTS Writing! Cấu trúc chuẩn là 'She suggested that I go'. Kiểm tra thêm lỗi khác!`,
        route: 'ielts.html#writing'
      },
      {
        title: '🚀 Cải thiện phát âm: Bẫy nối âm Connected Speech',
        body: `Tại sao 'first time' nghe như 'fers-time'? Tìm hiểu hiện tượng nuốt âm để nghe giọng người bản xứ không bị ngợp.`,
        route: 'ielts.html#listening'
      },
      {
        title: '🎧 Chế độ Commute Audio: Nghe thụ động trên đường',
        body: `Bật Commute Audio 5 phút trên xe buýt hoặc khi đi bộ để tắm ngôn ngữ không tốn sức!`,
        route: '#collocations'
      },
      {
        title: isWeekend
          ? '🚀 Cuối tuần bứt phá: Dành 15 phút tăng tốc Band IELTS!'
          : (currentHour < 12
              ? '🌅 Khởi đầu ngày mới: Nạp 3 cụm từ C2 cùng cà phê sáng'
              : (currentHour < 18
                  ? '🍱 3 phút nghỉ trưa: Reset não bộ với 1 bài đố phản xạ'
                  : '🌆 Xả stress cuối ngày: 5 phút luyện nói phản xạ cùng AI')),
        body: isWeekend
          ? 'Thử sức với 1 bài thi mô phỏng Mock Exam hoàn chỉnh để đo lường thực lực hiện tại!'
          : 'Duy trì đều đặn mỗi ngày là bí quyết duy nhất để biến tiếng Anh thành bản năng thứ hai.',
        route: isWeekend ? 'ielts.html#mock' : '#collocations'
      }
    ];

    const generalEn: Array<{ title: string; body: string; route: string }> = [
      {
        title: 'Time to learn today',
        body: `Ten minutes keeps your streak. ${progressLineEn}`,
        route: '#collocations'
      },
      {
        title: '☕ 3-Minute Coffee Break English: One sharp phrase',
        body: `Micro-learning compounds fast. Pick up 1 high-impact C2 expression today!`,
        route: '#collocations'
      },
      {
        title: '✍️ Franklin Copywork Studio: Master Band 8.0 Cohesion',
        body: `Reconstruct 1 rhetorical model sentence today to elevate your essay variety!`,
        route: 'ielts.html#writing'
      },
      {
        title: '🎙️ Speaking 4-3-2 Drill: Train fluency under pressure',
        body: `Your AI examiner is ready. 4 minutes of speech delivery eliminates hesitation!`,
        route: 'ielts.html#speaking'
      },
      {
        title: '🌙 Bedtime Recall: Lock in your lexicon',
        body: `5 minutes before sleep locks vocabulary into long-term memory. Retain your mastery!`,
        route: '#collocations'
      },
      {
        title: '💡 Native Collocation Secret: Do you know it?',
        body: `Native speakers don't 'make damage' - they 'inflict damage' or 'cause damage'. Master precise collocations!`,
        route: '#collocations'
      },
      {
        title: '🔍 Preposition Trap: ' + (ctx.targetWord || 'Juxtapose'),
        body: `'Agree with' vs 'Agree on'? Discover subtle nuances that separate Band 7 from Band 8!`,
        route: '#collocations'
      },
      {
        title: '⚡ High-Impact C2 Upgrade',
        body: `Swap 'big problem' for 'insurmountable obstacle' to impress examiners instantly!`,
        route: '#collocations'
      },
      {
        title: '🧩 False Friends Warning: Beware!',
        body: `'Actually' means 'in reality', not 'currently'. Don't let native language interference trip you up!`,
        route: '#collocations'
      },
      {
        title: '💎 Golden Essay Opener: ' + (ctx.targetWord || 'Paradigm'),
        body: `Upgrade 'Nowadays many people think' to 'It is widely contended in contemporary discourse'. Master rhetorical flair!`,
        route: 'ielts.html#writing'
      },
      {
        title: '🎯 Error Spotting: Is ' + '"' + 'She suggested me to go' + '"' + ' correct?',
        body: `This is a fatal Task 2 grammar slip! Correct: 'She suggested that I go'. Spot more traps in the vault!`,
        route: 'ielts.html#writing'
      },
      {
        title: '🚀 Pronunciation Nuance: Connected Speech Elision',
        body: `Why does 'first time' sound like 'fers-time'? Master consonant assimilation to decode rapid native accents.`,
        route: 'ielts.html#listening'
      },
      {
        title: '🎧 Commute Audio Mode: Passive ear training',
        body: `Switch on Commute Audio for 5 minutes during travel for effortless subconscious language immersion!`,
        route: '#collocations'
      },
      {
        title: isWeekend
          ? '🚀 Weekend Mastery Sprint: Push your IELTS Band Score!'
          : (currentHour < 12
              ? '🌅 Morning Momentum: Charge 3 C2 collocations with breakfast'
              : (currentHour < 18
                  ? '🍱 Midday Reset: Quick 3-minute quiz while taking a break'
                  : '🌆 Evening Flow: 5 minutes of speech practice to unwind')),
        body: isWeekend
          ? 'Take a full offline Academic Mock Test to benchmark your true band readiness!'
          : 'Daily continuity transforms English from conscious effort into effortless second nature.',
        route: isWeekend ? 'ielts.html#mock' : '#collocations'
      }
    ];

    const list = isVi ? generalVi : generalEn;
    const picked = list[Math.floor(Math.random() * list.length)];

    return {
      title: picked.title,
      body: picked.body,
      route: picked.route,
      category: 'daily_reminder',
      type: 'daily_reminder',
      tag: 'srs-review-due'
    };
  }

  /**
   * Fast curiosity / dynamic hook generator for Android Home Screen Widget.
   */
  public static getWidgetAlertHook(
    ctx: { dueCount: number; streak: number; questsLeft: number; completedQuests?: number; level: number },
    locale: Locale = 'en'
  ): string {
    const isVi = locale === 'vi';

    if (ctx.dueCount > 0) {
      const dueHooksVi = [
        `⚡ ${ctx.dueCount} thẻ chờ ôn • Cấp ${ctx.level}`,
        `🧠 ${ctx.dueCount} từ cần gợi nhớ • 48h`,
        `⚡ ${ctx.dueCount} thẻ SRS • Ôn 2 phút`
      ];
      const dueHooksEn = [
        `⚡ ${ctx.dueCount} cards due • Lv.${ctx.level}`,
        `🧠 ${ctx.dueCount} words due • 48h decay`,
        `⚡ ${ctx.dueCount} SRS cards • 2 min`
      ];
      const list = isVi ? dueHooksVi : dueHooksEn;
      return list[Math.floor(Math.random() * list.length)];
    }

    if (ctx.streak > 0 && ctx.questsLeft > 0) {
      const done = ctx.completedQuests ?? (3 - ctx.questsLeft);
      const streakHooksVi = [
        `🔥 Giữ chuỗi ${ctx.streak}d! • ${done}/3`,
        `🛡️ Khiên chuỗi ${ctx.streak} ngày • ${done}/3`,
        `⏳ Cứu chuỗi ${ctx.streak}d • Còn ${ctx.questsLeft} mục`
      ];
      const streakHooksEn = [
        `🔥 Protect ${ctx.streak}d! • ${done}/3`,
        `🛡️ ${ctx.streak}d Streak Shield • ${done}/3`,
        `⏳ Defend ${ctx.streak}d • ${ctx.questsLeft} left`
      ];
      const list = isVi ? streakHooksVi : streakHooksEn;
      return list[Math.floor(Math.random() * list.length)];
    }

    if (ctx.questsLeft > 0) {
      return isVi
        ? `🎯 Còn ${ctx.questsLeft} nhiệm vụ • Cấp ${ctx.level}`
        : `🎯 ${ctx.questsLeft} quests left • Lv.${ctx.level}`;
    }

    const completedHooksVi = [
      `✨ 3/3 Nhiệm vụ hoàn thành!`,
      `👑 Chuỗi ${ctx.streak || 1}d • Top 5% bền bỉ`,
      `💎 Đã nạp đủ năng lượng hôm nay!`
    ];
    const completedHooksEn = [
      `✨ 3/3 Quests completed!`,
      `👑 ${ctx.streak || 1}d Streak • Top 5% grit`,
      `💎 Daily quota accomplished!`
    ];
    const list = isVi ? completedHooksVi : completedHooksEn;
    return list[Math.floor(Math.random() * list.length)];
  }

  /**
   * Generates a 1-line curiosity or collocation tip specifically tailored for the widget header or ticker.
   */
  public static getWidgetCuriosityTip(locale: Locale = 'en'): { text: string; kicker: string } {
    const isVi = locale === 'vi';
    const tipsVi = [
      { kicker: 'COLLOCATION', text: '“inflict damage” chuẩn hơn “make damage”' },
      { kicker: 'C2 UPGRADE', text: 'Thay “big problem” bằng “insurmountable obstacle”' },
      { kicker: 'TASK 2 TIP', text: 'Dùng “It is widely contended that...” thay “In my opinion”' },
      { kicker: 'SPEAKING', text: 'Luyện 4-3-2 để xóa tan từ đệm uhm, ah' },
      { kicker: 'BẪY GIỚI TỪ', text: '“agree with someone” nhưng “agree to a proposal”' },
      { kicker: 'FALSE FRIEND', text: '“Actually” là “thực ra là”, không phải “hiện tại”' },
      { kicker: 'READING TIP', text: 'Phân biệt rạch ròi giữa False (trái ngược) và Not Given' }
    ];
    const tipsEn = [
      { kicker: 'COLLOCATION', text: 'Say “inflict damage” instead of “make damage”' },
      { kicker: 'C2 UPGRADE', text: 'Upgrade “big problem” to “insurmountable obstacle”' },
      { kicker: 'TASK 2 TIP', text: 'Open with “It is widely contended that...”' },
      { kicker: 'SPEAKING', text: '4-3-2 pacing drill completely eliminates fillers' },
      { kicker: 'PREPOSITIONS', text: '“agree with someone” vs “agree to a proposal”' },
      { kicker: 'FALSE FRIEND', text: '“Actually” means “in reality”, not “currently”' },
      { kicker: 'READING TIP', text: 'Differentiate False (contradicted) from Not Given' }
    ];
    const list = isVi ? tipsVi : tipsEn;
    return list[Math.floor(Math.random() * list.length)];
  }
}
