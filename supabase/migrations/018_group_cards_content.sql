-- Content-based group cards replacing the old file-upload approach
CREATE TABLE IF NOT EXISTS group_cards_content (
  id           uuid default gen_random_uuid() primary key,
  day_number   integer not null,
  card_number  integer not null default 1,
  label        text not null default '',
  content      text not null default '',
  content_color text not null default '#C83030',
  label_color  text not null default 'rgba(100,50,50,0.85)',
  bg_color     text not null default '#1a0808',
  sort_order   integer not null default 0,
  created_at   timestamptz default now()
);

ALTER TABLE group_cards_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read group_cards_content"
  ON group_cards_content FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated can manage group_cards_content"
  ON group_cards_content FOR ALL TO authenticated USING (true);

-- Seed: Day 1 (9 cards)
INSERT INTO group_cards_content (day_number, card_number, label, content, content_color, label_color, bg_color, sort_order) VALUES

(1, 1, 'Welcome to High School Camp!',
'<p>This small group is meant to help us think, share ideas, and discuss the topics and scriptures that we''ll encounter throughout our week at camp. Let''s get started!</p>',
'#C83030', 'rgba(139,80,50,0.85)', '#1a0808', 1),

(1, 2, 'Poll It',
'<p>Which of these would be the hardest to live without for a week?</p><ul><li><p>Snacks</p></li><li><p>Music</p></li><li><p>Phone</p></li><li><p>Caffeine</p></li><li><p>Video Games</p></li><li><p>Showers</p></li><li><p>Car</p></li></ul>',
'#C83030', 'rgba(130,90,40,0.85)', '#1a0a00', 2),

(1, 3, 'Hot Seat',
'<p>Pick someone in the group to be on the "hot seat." Have them stand in the middle of the group and hit start on the timer. You have 60 seconds to ask as many fun and random questions to them.</p><p>Have at least 3 people in the group be on the "hot seat" before you move on.</p>',
'#C020A0', 'rgba(140,60,120,0.85)', '#1a0018', 3),

(1, 4, 'The Big Three',
'<p>Let''s come up with 3 words that we want to define our group this week.</p><p>What three words do we want to use, and what do those words mean for us? (Examples: WALK means we all will participate, UNITY means we''re in it together, etc.)</p><ol><li><p></p></li><li><p></p></li><li><p></p></li></ol><p>Be sure to have someone write these down or put them in a note on their phone.</p>',
'#4050D0', 'rgba(60,80,180,0.85)', '#08082a', 4),

(1, 5, 'The Big Three',
'<p>What are you hoping to experience this week?</p><p>We know each of us may be in different places in our walk with Jesus. Some of you are investigating Jesus for the first time and some trying to reconnect with God. This week we want to give you space to explore, ask questions, and ultimately decide for yourself what you believe.</p><p>"If God was trying to get your attention this week, what might make it hard for you to notice or hear Him?"</p>',
'#18186a', 'rgba(50,50,100,0.85)', '#060618', 5),

(1, 6, 'Hold On!',
'<p>This week at HSC we''ll take a closer look at the book of Hebrews, a book that was written for a group of Christians who were debating going back to their old ways.</p><ol><li><p>When was the last time you felt like giving up but didn''t? What happened and how did you hold on?</p></li><li><p>What''s one thing you''re curious or unsure about when it comes to Jesus?</p></li><li><p>Whether you''ve grown up hearing about Jesus or this is your first time around Him, what do you want to be different about your understanding of Jesus or relationship with Him?</p></li></ol>',
'#1878C0', 'rgba(30,90,140,0.85)', '#041428', 6),

(1, 7, 'Remember',
'<p>Let''s take a second to have a reminder of our 3 Camp Expectations:</p><ol><li><p>Be where you''re supposed to be when you''re supposed to be there.</p></li><li><p>Respect ALL People.</p></li><li><p>Respect ALL spaces – let''s be great guests here at IU.</p></li></ol>',
'#C07010', 'rgba(140,100,20,0.85)', '#1a0e00', 7),

(1, 8, 'Group Photo',
'<p>It''s time to take a group photo! Don''t forget to post your photo with #HSC26 and what campus you are with.</p>',
'#8030C0', 'rgba(100,50,160,0.85)', '#120018', 8),

(1, 9, 'Pray It',
'<p>Pray this prayer of blessing over your small group.</p><p>Dear God, In the in-between moments, help us to listen for Your voice, trust in Your timing, and walk faithfully with You. Remind us that You are enough for today. Amen.</p>',
'#2070C0', 'rgba(30,70,140,0.85)', '#040e1a', 9);
