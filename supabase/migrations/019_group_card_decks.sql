-- Group card decks + items (replaces group_cards_content)
DROP TABLE IF EXISTS group_cards_content CASCADE;

CREATE TABLE IF NOT EXISTS group_card_decks (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title         text NOT NULL DEFAULT '',
  session_label text NOT NULL DEFAULT '',
  day_number    integer NOT NULL DEFAULT 1,
  session_type  text NOT NULL DEFAULT 'morning',
  sort_order    integer NOT NULL DEFAULT 0,
  bar_color     text NOT NULL DEFAULT '#38B6FF',
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_card_items (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id    uuid NOT NULL REFERENCES group_card_decks(id) ON DELETE CASCADE,
  title      text NOT NULL DEFAULT '',
  subtitle   text NOT NULL DEFAULT '',
  content    text NOT NULL DEFAULT '',
  bg_color   text NOT NULL DEFAULT '#1a0808',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE group_card_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_card_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read group_card_decks"
  ON group_card_decks FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can manage group_card_decks"
  ON group_card_decks FOR ALL TO authenticated USING (true);
CREATE POLICY "Public can read group_card_items"
  ON group_card_items FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can manage group_card_items"
  ON group_card_items FOR ALL TO authenticated USING (true);

-- ── Seed: all 11 decks ────────────────────────────────────────────────────────
INSERT INTO group_card_decks (title, session_label, day_number, session_type, sort_order, bar_color) VALUES
('Pre-Camp Launch Party',         'Pre-Camp',                         0, 'precamp', 1,  '#7030A0'),
('Day 1 – Pre Camp Conversation', 'Day 1 · Before First Session',     1, 'morning', 2,  '#1878C0'),
('Day 1 – Evening Group',         'Day 1 · Evening',                  1, 'evening', 3,  '#207850'),
('Day 2 – Morning Group',         'Day 2 · Morning · KW Are Loved',   2, 'morning', 4,  '#C83030'),
('Day 2 – Evening Group',         'Day 2 · Evening · KW Are Loved',   2, 'evening', 5,  '#7030A0'),
('Day 3 – Morning Group',         'Day 3 · Morning · KW Are Rescued', 3, 'morning', 6,  '#1878C0'),
('Day 3 – Evening Group',         'Day 3 · Evening · KW Are Rescued', 3, 'evening', 7,  '#207850'),
('Day 4 – Morning Group',         'Day 4 · Morning · KW Are Changed', 4, 'morning', 8,  '#C83030'),
('Day 4 – Evening Group',         'Day 4 · Evening · KW Are Changed', 4, 'evening', 9,  '#7030A0'),
('Day 5 – Morning Group',         'Day 5 · Morning · KW Are Sent',    5, 'morning', 10, '#1878C0'),
('Day 5 – Bus Ride Home',         'Day 5 · Bus Ride · KW Are Sent',   5, 'busride', 11, '#207850');

-- ── Deck 1: Pre-Camp Launch Party (7 cards) ───────────────────────────────────
INSERT INTO group_card_items (deck_id, title, subtitle, content, bg_color, sort_order) VALUES
((SELECT id FROM group_card_decks WHERE sort_order=1),'LEADER SETUP','Welcome',
'<p>Some of us have done things like camp and small groups before, and some of us are brand new. There''s no pressure to share anything you''re not ready to. Being here is enough.</p>',
'#1a0818',1),
((SELECT id FROM group_card_decks WHERE sort_order=1),'CONNECT TOGETHER','Introductions',
'<p>Share your name, where you go to school, and one thing you enjoy doing outside of school.</p><p><em>Leader note: Circulate, listen, learn names. This matters more than the next question.</em></p>',
'#0a1020',2),
((SELECT id FROM group_card_decks WHERE sort_order=1),'SHARE IT','Discussion',
'<p>When you hear the word <em>identity</em>, what do you think of? What''s one thing people your age usually let define them?</p>',
'#1a0808',3),
((SELECT id FROM group_card_decks WHERE sort_order=1),'READ IT','Scripture',
'<p>At HSC this summer we''re going to be spending our whole time in a book of the Bible called Ephesians. Ephesians is a letter Paul wrote to the church in Ephesus, reminding them of their identity in Christ and how that changes the way they live.</p><p>Have someone read <strong>Ephesians 2:10</strong> out loud.</p><p>According to this verse, how does it describe people? What words stand out to you?</p>',
'#082010',4),
((SELECT id FROM group_card_decks WHERE sort_order=1),'ASK IT','Personal Reflection',
'<p>Leader goes first briefly: "For me, one confusing part of figuring out who I am has been…"</p><p>Then ask: What part of figuring out who you are feels confusing or stressful right now?</p>',
'#1a1000',5),
((SELECT id FROM group_card_decks WHERE sort_order=1),'LIVE IT','Application',
'<p>What''s one thing about your life or story you wish people understood better?</p>',
'#0a0a20',6),
((SELECT id FROM group_card_decks WHERE sort_order=1),'PRAY IT','Group Prayer',
'<p>Have your leader or a student pray this:</p><p>"God, we''re all coming into HSC from different places. If You have something You want us to see or understand, help us stay open. Meet us right where we are. Amen."</p>',
'#041428',7);

-- ── Deck 2: Day 1 Pre Camp Conversation (6 cards) ────────────────────────────
INSERT INTO group_card_items (deck_id, title, subtitle, content, bg_color, sort_order) VALUES
((SELECT id FROM group_card_decks WHERE sort_order=2),'LEADER SETUP','Welcome',
'<p>Hey, welcome to High School Camp – I''m so glad each of you are here.</p><p>Every day we''ll gather as a group just like this. Our group is a safe space. You can be yourself. You don''t need to prove anything this week. No matter what you have going on, it is welcome here.</p>',
'#0d1a2a',1),
((SELECT id FROM group_card_decks WHERE sort_order=2),'CONNECT','Check-In',
'<p>One word check-in: What''s one word that describes how you''re feeling right now?</p><p><em>Leader goes first to model honesty.</em></p>',
'#1a0a2a',2),
((SELECT id FROM group_card_decks WHERE sort_order=2),'READ IT','Scripture',
'<p>Have someone read <strong>Ephesians 1:16-18 (NIV)</strong>.</p><p>In these verses, what is Paul asking God to help people experience?</p><p>Which of these prayers from Ephesians 1:16-18 do you want to pray for yourself this week?</p>',
'#082010',3),
((SELECT id FROM group_card_decks WHERE sort_order=2),'ASK IT','Personal Reflection',
'<p>If something were to really make sense for the first time for you this week, what do you hope it would be about?</p><p>Where do you need God to meet you this week?</p>',
'#1a1000',4),
((SELECT id FROM group_card_decks WHERE sort_order=2),'LIVE IT','Application',
'<p>What''s one thing that could make it hard for you to be present this week — and one thing that might help instead?</p><p><strong>Examples of obstacles:</strong></p><ul><li>Phone</li><li>Fear of sharing</li><li>Comparing</li><li>Being tired</li></ul><p><strong>Examples of things that might help:</strong></p><ul><li>A new friend</li><li>Time with this group</li></ul>',
'#0a0a20',5),
((SELECT id FROM group_card_decks WHERE sort_order=2),'PRAY IT','Quiet Prayer',
'<p><em>Leader cue: "If it helps you focus, you can close your eyes or rest your hands open on your lap."</em></p><p>Take a quiet moment. In your own words — or just in your head — ask God to help you stay open to whatever this week brings.</p>',
'#041428',6);

-- ── Deck 3: Day 1 Evening Group (5 cards) ────────────────────────────────────
INSERT INTO group_card_items (deck_id, title, subtitle, content, bg_color, sort_order) VALUES
((SELECT id FROM group_card_decks WHERE sort_order=3),'BE STILL','Quiet Reflection',
'<p>Set a 1-minute timer. No phones or objects in hands. Invite stillness — eyes closed optional.</p><p>Take a minute to be still. Breathe. Think back over tonight — what you heard, felt, or experienced.</p><p>What feels like it''s sticking with you right now?</p>',
'#0d2040',1),
((SELECT id FROM group_card_decks WHERE sort_order=3),'LEARN IT','Pro Tips',
'<p>We''re so glad you''re here at HSC. Some of you might be here for the first time, so we want to take some time for those who have been to camp before to share some "pro tips" on how to get the most out of the week.</p><p>Let''s hear from a few students and our leaders.</p>',
'#1a0a2a',2),
((SELECT id FROM group_card_decks WHERE sort_order=3),'WRITE IT DOWN','Personal Processing',
'<p>Think back to the message, worship, and time tonight as we talked about Kingdom Workers Are...</p><p>Maybe look at your notes if you need a reminder.</p><p>Summarize your 1 main highlight from tonight into 1 sentence — it could be a verse from a song we sang or something from the message.</p><p>Write it down, then we''ll go around the group and give each person a chance to share it and why they chose that.</p><p><em>If you don''t want to share yet — no pressure.</em></p>',
'#0a1a10',3),
((SELECT id FROM group_card_decks WHERE sort_order=3),'SHARE IT','Story & Vulnerability',
'<p>Each evening we''ll create space for our group to have open conversations. Nothing is off the table. If it''s on your mind, this is a chance to share it.</p><p>A helpful way to think about this time: it''s a chance for each of us to take out some hidden weight we''ve been carrying. Sharing with a group helps you know you''re not alone, invites others to see you, love you, and pray for you.</p><p>Is there anything God was speaking tonight that you want to process together?</p>',
'#1a0808',4),
((SELECT id FROM group_card_decks WHERE sort_order=3),'PRAY TOGETHER','Group Prayer',
'<p>Tonight we''re going to wrap up with prayer. Prayer is simply talking to God. This might be new to you — so we''re going to pray this together. I''ll read it first and then you repeat after me.</p><p>God – thank you for today.<br>Thank you for bringing me to High School Camp.<br>Help me to see you.<br>Help me to know you.<br>Help me to know who YOU say I am.<br>Meet me here this week.<br>Help me Jesus.<br>Amen.</p>',
'#041428',5);

-- ── Deck 4: Day 2 Morning Group (6 cards) ────────────────────────────────────
INSERT INTO group_card_items (deck_id, title, subtitle, content, bg_color, sort_order) VALUES
((SELECT id FROM group_card_decks WHERE sort_order=4),'SHARE IT','Personal Question',
'<p>What''s your favorite memory with someone who''s important in your life?</p><p>What made that memory so good?</p>',
'#1a0808',1),
((SELECT id FROM group_card_decks WHERE sort_order=4),'SELAH RESPONSE','Reflection',
'<p>What stood out to you?</p><p>Was anything hard or distracting?</p><p>Did this feel new or familiar?</p>',
'#1a0a2a',2),
((SELECT id FROM group_card_decks WHERE sort_order=4),'READ IT','Scripture',
'<p>What sticks to you in this passage? Is there anything that confuses you?</p><p>How are the followers of Christ described in this passage?</p><p>Re-read verses 11-14. What is the "inheritance" that has been for us from the beginning? What does it say that the Holy Spirit is for us? What does it mean for him to be a seal or "deposit"?</p>',
'#082010',3),
((SELECT id FROM group_card_decks WHERE sort_order=4),'ASK IT','Personal Reflection',
'<p>What does it mean to be chosen from the beginning?</p><p>How does that change how you see your life?</p><p>How do you think God sees you after reading these verses?</p>',
'#1a1000',4),
((SELECT id FROM group_card_decks WHERE sort_order=4),'LIVE IT','Application',
'<p>"What helps you start seeing yourself the way God sees you? If you''re not sure – what do you think COULD help you begin to see yourself that way?"</p>',
'#0a0a20',5),
((SELECT id FROM group_card_decks WHERE sort_order=4),'PRAY IT','Group Prayer',
'<p>Invite the students to pray this:</p><p>Dear Lord, you are the creator of all things and all people. And you created me intentionally, and I am grateful that you intentionally chose me. Help me to see myself the way you see me.</p>',
'#041428',6);

-- ── Deck 5: Day 2 Evening Group (5 cards) ────────────────────────────────────
INSERT INTO group_card_items (deck_id, title, subtitle, content, bg_color, sort_order) VALUES
((SELECT id FROM group_card_decks WHERE sort_order=5),'BE STILL','Quiet Reflection',
'<p>Set a 1-minute timer. No phones or objects in hands. Invite stillness — eyes closed optional.</p><p>Take a minute to be still. Breathe. Think back over today — what you heard, felt, or experienced.</p><p>What feels like it''s sticking with you right now?</p>',
'#0d2040',1),
((SELECT id FROM group_card_decks WHERE sort_order=5),'LEARN IT','Discussion',
'<p>We just learned that we are all invited to experience the fullness of God''s love.</p><p>Does anyone think they have ever felt the fullness of God''s love? Will you share what happened and how that changed how you see God?</p>',
'#1a0a2a',2),
((SELECT id FROM group_card_decks WHERE sort_order=5),'WRITE IT DOWN','Personal Processing',
'<p>Think back to the message, worship, and time tonight as we talked about being invited into the fullness of God''s love.</p><p>Summarize everything we heard and experienced tonight into one sentence, write it down, and then we will go around the circle and share it if you''re ready.</p><p><em>Be honest about what you think even if you still feel confused.</em></p>',
'#0a1a10',3),
((SELECT id FROM group_card_decks WHERE sort_order=5),'SHARE IT','Story & Vulnerability',
'<p>After everything we have heard, experienced and seen today, we want to create space for you to share about anything you are processing.</p><p>Does anyone have anything that they feel like they need to share about what they''re learning or maybe even feeling?</p>',
'#1a0808',4),
((SELECT id FROM group_card_decks WHERE sort_order=5),'PRAY TOGETHER','Group Prayer',
'<p>God, give us the eyes to see the fullness of your love for us and soften our hearts so we can receive all of it.</p>',
'#041428',5);

-- ── Deck 6: Day 3 Morning Group (6 cards) ────────────────────────────────────
INSERT INTO group_card_items (deck_id, title, subtitle, content, bg_color, sort_order) VALUES
((SELECT id FROM group_card_decks WHERE sort_order=6),'SHARE IT','Personal Question',
'<p>Each person in the group is going to share 2 truths and 1 lie about themselves. After sharing, the group will have 30 seconds to unanimously guess which one is the lie.</p><p>How would you describe yourself using only 3 words?</p>',
'#1a0808',1),
((SELECT id FROM group_card_decks WHERE sort_order=6),'SELAH RESPONSE','Reflection',
'<p>What stood out to you?</p><p>Was anything hard or distracting?</p><p>Did this feel new or familiar?</p>',
'#1a0a2a',2),
((SELECT id FROM group_card_decks WHERE sort_order=6),'READ IT','Scripture',
'<p>What is Paul (the author of this letter) asking God to do for the church in Ephesus?</p><p>How is God described in these verses?</p><p>What three things do verses 18-19 say God''s people receive?</p>',
'#082010',3),
((SELECT id FROM group_card_decks WHERE sort_order=6),'ASK IT','Personal Reflection',
'<p>In what area of your life do you need confident hope?</p>',
'#1a1000',4),
((SELECT id FROM group_card_decks WHERE sort_order=6),'LIVE IT','Application',
'<p>What will help you hold on to hope when things get hard?</p>',
'#0a0a20',5),
((SELECT id FROM group_card_decks WHERE sort_order=6),'PRAY IT','Leader Prayer',
'<p>Leader prayer over students:</p><p>I pray that your hearts will be able to understand the confident hope God has given to His people.</p>',
'#041428',6);

-- ── Deck 7: Day 3 Evening Group (5 cards) ────────────────────────────────────
INSERT INTO group_card_items (deck_id, title, subtitle, content, bg_color, sort_order) VALUES
((SELECT id FROM group_card_decks WHERE sort_order=7),'BE STILL','Quiet Reflection',
'<p>Set a 1-minute timer. No phones or objects in hands. Invite stillness — eyes closed optional.</p><p>Take a minute to be still. Breathe. Think back over today — what you heard, felt, or experienced.</p><p>What feels like it''s sticking with you right now?</p>',
'#0d2040',1),
((SELECT id FROM group_card_decks WHERE sort_order=7),'LEARN IT','Discussion',
'<p>For anyone who believes in Jesus and has taken the step to be baptized — share about your life before and after meeting Jesus and encountering his love.</p>',
'#1a0a2a',2),
((SELECT id FROM group_card_decks WHERE sort_order=7),'WRITE IT DOWN','Personal Processing',
'<p>Grace is getting something you need but don''t deserve. Mercy is NOT getting the punishment you do deserve.</p><p>Why do you need God''s grace and mercy?</p>',
'#0a1a10',3),
((SELECT id FROM group_card_decks WHERE sort_order=7),'SHARE IT','Story & Vulnerability',
'<p>How does what we''ve talked about and experienced today give you hope?</p>',
'#1a0808',4),
((SELECT id FROM group_card_decks WHERE sort_order=7),'PRAY TOGETHER','Group Prayer',
'<p>Leader options:</p><ul><li>One leader-prayed prayer</li><li>Silent prayer</li><li>One-sentence group prayer</li></ul>',
'#041428',5);

-- ── Deck 8: Day 4 Morning Group (6 cards) ────────────────────────────────────
INSERT INTO group_card_items (deck_id, title, subtitle, content, bg_color, sort_order) VALUES
((SELECT id FROM group_card_decks WHERE sort_order=8),'SHARE IT','Personal Question',
'<p>What would your friends or family say that you''re naturally good at?</p><p>What makes someone a good teammate or friend? What makes someone a <em>bad</em> teammate or friend?</p>',
'#1a0808',1),
((SELECT id FROM group_card_decks WHERE sort_order=8),'SELAH RESPONSE','Reflection',
'<p>What stood out to you?</p><p>Was anything hard or distracting?</p><p>Did this feel new or familiar?</p>',
'#1a0a2a',2),
((SELECT id FROM group_card_decks WHERE sort_order=8),'READ IT','Scripture',
'<p>What words or phrases stick out to you in this passage? What questions do you have about what Paul is saying here?</p><p>In verses 4–6, how many times do you see the word "one"? Why do you think Paul repeats that word so often?</p><p>Reread verses 11-13. Why do you think God chooses to use ordinary people to accomplish his purposes?</p>',
'#082010',3),
((SELECT id FROM group_card_decks WHERE sort_order=8),'ASK IT','Personal Reflection',
'<p>What can cause disunity in relationships?</p><p>How can different personalities and gifts build unity? How about within the church?</p><p>In verses 15-16, Paul describes a loving community where everyone plays a part. Imagine belonging in a community like this. What would it feel like?</p>',
'#1a1000',4),
((SELECT id FROM group_card_decks WHERE sort_order=8),'LIVE IT','Application',
'<p>Who is one person you could invite to help you build a community like this?</p>',
'#0a0a20',5),
((SELECT id FROM group_card_decks WHERE sort_order=8),'PRAY IT','Group Prayer',
'<p><em>If it helps you focus, you might want to close your eyes and rest your hands open on your lap.</em></p><p>GROUP PRAYER: Lord, lead each of us to a loving community where we can belong.</p>',
'#041428',6);

-- ── Deck 9: Day 4 Evening Group (5 cards) ────────────────────────────────────
INSERT INTO group_card_items (deck_id, title, subtitle, content, bg_color, sort_order) VALUES
((SELECT id FROM group_card_decks WHERE sort_order=9),'BE STILL','Quiet Reflection',
'<p>Set a 1-minute timer. No phones or objects in hands. Invite stillness — eyes closed optional.</p><p>Take a minute to be still. Breathe. Think back over today — what you heard, felt, or experienced.</p><p>What feels like it''s sticking with you right now?</p>',
'#0d2040',1),
((SELECT id FROM group_card_decks WHERE sort_order=9),'LEARN IT','Discussion',
'<p>How do you build on the foundation of what you experienced at camp once you come home?</p><p>For those who have been to camp before – what has helped you in past years make sure the transformation and friendships don''t just end after camp?</p>',
'#1a0a2a',2),
((SELECT id FROM group_card_decks WHERE sort_order=9),'WRITE IT DOWN','Personal Processing',
'<p>What''s one thing you don''t want to forget from today?</p><p>It could be serious, funny, confusing, or unexpected. Write it down.</p><p><em>After writing, invite students (not required) to share.</em></p>',
'#0a1a10',3),
((SELECT id FROM group_card_decks WHERE sort_order=9),'SHARE IT','Story & Vulnerability',
'<p>How has God challenged you this week?</p>',
'#1a0808',4),
((SELECT id FROM group_card_decks WHERE sort_order=9),'PRAY TOGETHER','Group Prayer',
'<p>Prayer Type: One leader prayed prayer.</p><p>Prompt: God, thank you for never asking us to do life alone.</p>',
'#041428',5);

-- ── Deck 10: Day 5 Morning Group (6 cards) ───────────────────────────────────
INSERT INTO group_card_items (deck_id, title, subtitle, content, bg_color, sort_order) VALUES
((SELECT id FROM group_card_decks WHERE sort_order=10),'SHARE IT','Personal Question',
'<p>What is the farthest place you have travelled? Why were you there?</p><p>What makes a place feel like home to you?</p>',
'#1a0808',1),
((SELECT id FROM group_card_decks WHERE sort_order=10),'SELAH RESPONSE','Reflection',
'<p>What stood out to you?</p><p>Was anything hard or distracting?</p><p>Did this feel new or familiar?</p>',
'#1a0a2a',2),
((SELECT id FROM group_card_decks WHERE sort_order=10),'READ IT','Scripture',
'<p>Read <strong>Ephesians 6:1-9</strong>. What do you think this passage teaches about authority and responsibility?</p><p>What do you think Paul meant when he said "As slaves of Christ, do the will of God with all your heart"?</p>',
'#082010',3),
((SELECT id FROM group_card_decks WHERE sort_order=10),'ASK IT','Personal Reflection',
'<p>Which of these commandments comes the easiest and which comes more difficult for you?</p><p>What shapes the way you interact with people the most?</p><p>How does this passage affect the way we treat the people in our lives?</p>',
'#1a1000',4),
((SELECT id FROM group_card_decks WHERE sort_order=10),'LIVE IT','Application',
'<p>How can you honor and love your parents in a new way today and then later when you get home?</p>',
'#0a0a20',5),
((SELECT id FROM group_card_decks WHERE sort_order=10),'PRAY IT','Group Prayer',
'<p><em>If you are able and comfortable, let''s kneel around the room to pray today; sitting in your chair is also perfect.</em></p><p>Spend some time praying silently. Start by praying this prayer:</p><p>God send me to impact the world closest to me, use me for your Kingdom work.</p>',
'#041428',6);

-- ── Deck 11: Day 5 Bus Ride Home (4 cards) ───────────────────────────────────
INSERT INTO group_card_items (deck_id, title, subtitle, content, bg_color, sort_order) VALUES
((SELECT id FROM group_card_decks WHERE sort_order=11),'BE STILL','Quiet Reflection',
'<p>Set a 1-minute timer. No phones or objects in hands. Invite stillness — eyes closed optional.</p><p>Take a minute to be still. Breathe. Think back over today — what you heard, felt, or experienced.</p><p>What feels like it''s sticking with you right now?</p>',
'#0d2040',1),
((SELECT id FROM group_card_decks WHERE sort_order=11),'LEARN IT','Highlights',
'<p>Tell your neighbor your biggest highlight from this week. Let a few people share with the whole group.</p>',
'#1a0a2a',2),
((SELECT id FROM group_card_decks WHERE sort_order=11),'WRITE IT DOWN','Personal Processing',
'<p>What''s one thing you don''t want to forget from today or this whole week?</p><p>It could be serious, funny, confusing, or unexpected. Write it down.</p><p><em>After writing, invite students (not required) to share.</em></p>',
'#0a1a10',3),
((SELECT id FROM group_card_decks WHERE sort_order=11),'SHARE IT','Story & Vulnerability',
'<p>What surprised you the most this week? What had the biggest impact?</p><p><em>Optional deeper prompt (Leader discretion):</em> Would anyone like to share a part of their story tonight that they may have never shared in a group like this before?</p>',
'#1a0808',4);
